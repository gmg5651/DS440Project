import { calculateSimilarity } from '@/utils/stringSimilarity';
import { getGramsPerUnit } from '@/utils/unitMapping';

const API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export interface USDAMatch {
    name: string;
    fdcId: number;
    score: number;
    carbs100g: number;
    gramsPerUnit: number;
    unitName: string;
}

// ── Step 1: Search Foundation + SR Legacy ONLY ──────────────────────────────
export async function searchUSDAFood(query: string): Promise<USDAMatch | null> {
    if (!API_KEY) throw new Error('USDA API Key missing');

    const searchUrl = `${BASE_URL}/foods/search?api_key=${API_KEY}`;
    const response = await fetch(searchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query,
            pageSize: 10,
            // Only clean, generic foods – no branded/baby/survey noise
            dataType: ['Foundation', 'SR Legacy'],
            sortBy: 'dataType.keyword',
            sortOrder: 'asc',
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`USDA Search failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const foods: any[] = data.foods || [];
    if (foods.length === 0) return null;

    // ── Step 2: Rank results ─────────────────────────────────────────────────
    const q = query.toLowerCase();
    const queryWords = q.split(/\s+/);

    // Bad prefixes = heavy penalty so they never win
    const BAD_PREFIXES = [
        'babyfood', 'baby food', 'infant', 'fast food', 'fast foods',
        'military', 'mcdonald', 'burger king',
    ];
    // Bad qualifiers anywhere in name = light penalty
    const BAD_QUALIFIERS = ['dried', 'dehydrated', 'chips', 'candy', 'powder', 'extract'];

    const candidates = foods.map((f: any) => {
        const desc = f.description.toLowerCase();

        let sim = calculateSimilarity(query, f.description);

        // A. Word Overlap Bonus (NEW) - massive boost if all words in query exist in description
        // This solves "Gala Apple" -> matches "Apples, gala, with skin, raw" beating "Strudel"
        const allWordsMatch = queryWords.every(w => {
            // handle "apple" matching "apples"
            return desc.includes(w) || desc.includes(w + 's') || (w.endsWith('s') && desc.includes(w.slice(0, -1)));
        });
        if (allWordsMatch) sim += 0.6;

        // B. Prefix bonus – "Bananas, raw" starts with "banana"
        if (desc.startsWith(q) || desc.startsWith(queryWords[queryWords.length - 1])) sim += 0.25;

        // C. Exact/plural bonus
        if (desc === q || desc === q + 's' || desc + 's' === q) sim += 0.5;

        // C2. Primary word bonus – heavy boost if the text before the first comma is the query
        // This makes "Milk" match "Milk, whole" instead of "Yogurt, with whole milk"
        const primaryWord = desc.split(',')[0].trim();
        if (primaryWord === q || primaryWord === q + 's' || (q.endsWith('s') && primaryWord === q.slice(0, -1))) {
            sim += 0.45;
        }

        // D. "raw" bonus – simple, unprocessed
        if (desc.includes('raw')) sim += 0.1;

        // D. Length penalty
        const penalty = Math.min(0.4, ((f.description.length / query.length) - 1) * 0.05);

        // E. Category prefix penalty
        const hasBadPrefix = BAD_PREFIXES.some(p => desc.startsWith(p));
        const badPrefixPenalty = hasBadPrefix ? 0.6 : 0;

        // F. Qualifier penalty (dried, chips, etc.)
        const hasBadQualifier = BAD_QUALIFIERS.some(bq => desc.includes(bq));
        const qualifierPenalty = hasBadQualifier ? 0.2 : 0;

        // G. Data-type priority
        const priority = f.dataType === 'Foundation' ? 1.3 : 1.1; // both are Foundation or SR Legacy

        const score = (sim - penalty - badPrefixPenalty - qualifierPenalty) * priority;

        // H. Carbs – from search result (Foundation/SR Legacy use n.value / n.nutrientName)
        const carbNutrient = f.foodNutrients?.find((n: any) => {
            const name = (n.nutrientName || n.nutrient?.name || '').toLowerCase();
            return name.includes('carbohydrate, by difference');
        });
        const carbs100g = carbNutrient ? (carbNutrient.value ?? carbNutrient.amount ?? 0) : 0;

        return { name: f.description, fdcId: f.fdcId, score, carbs100g };
    });

    candidates.sort((a, b) => b.score - a.score);
    const winner = candidates[0];

    // ── Step 3: Fetch detail for winner – the only place foodPortions lives ──
    const gramsInfo = await resolvePortionGrams(winner.fdcId, query, winner.name);

    return {
        name: winner.name,
        fdcId: winner.fdcId,
        score: winner.score,
        carbs100g: winner.carbs100g,
        gramsPerUnit: gramsInfo.grams,
        unitName: gramsInfo.unitName,
    };
}

// ── Step 3 helper: resolve grams per 1 unit for per-item foods ───────────────
// Intelligent weighing strategy:
// 1. unitMapping is the baseline (always sensible)
// 2. USDA detail call is used as an upgrade when we find amount===1 + clean unit
async function resolvePortionGrams(
    fdcId: number,
    query: string,
    foodName: string,
): Promise<{ grams: number; unitName: string }> {
    // Baseline: our unit-weight map (banana → 118g, apple → 182g, etc.)
    const baseline = getGramsPerUnit(foodName || query);

    try {
        const res = await fetch(`${BASE_URL}/food/${fdcId}?api_key=${API_KEY}`);
        if (!res.ok) throw new Error('detail failed');
        const detail = await res.json();
        const portions: any[] = detail.foodPortions || [];

        // Foundation foods use measureUnit.name (e.g. "Banana") instead of portionDescription.
        // SR Legacy uses portionDescription (e.g. "1 medium (7\" to 7-7/8\" long)").
        // We build a unified label from whichever field is available.
        const labelOf = (p: any): string =>
            p.portionDescription ||
            (p.measureUnit?.name && p.measureUnit.name !== 'undetermined' ? p.measureUnit.name : '') ||
            p.modifier ||
            '';

        // Volumetric/abstract units to skip when looking for "1 item" equivalents
        const AVOID = ['cup', 'tbsp', 'tsp', 'tablespoon', 'teaspoon',
            '100 g', '100g', 'mashed', 'sliced', 'chopped',
            'linear inch', 'nlea', 'racc', 'quantity not specified'];

        // Filter: amount === 1, gram weight present, not a volumetric unit
        const unitPortions = portions.filter((p: any) => {
            const label = labelOf(p).toLowerCase();
            const amount = p.amount ?? 1;
            return amount === 1 && p.gramWeight && !AVOID.some(a => label.includes(a));
        });

        // Prefer single-item descriptors in this order
        const PREFER = ['medium', 'large', 'small', 'piece', 'item', 'each', query.toLowerCase()];
        for (const keyword of PREFER) {
            const match = unitPortions.find(p => labelOf(p).toLowerCase().includes(keyword));
            if (match) {
                return { grams: match.gramWeight, unitName: labelOf(match) || `${match.gramWeight}g` };
            }
        }

        // Accept first clean unit portion even without a preferred keyword
        if (unitPortions.length > 0) {
            const first = unitPortions[0];
            return { grams: first.gramWeight, unitName: labelOf(first) || `${first.gramWeight}g` };
        }

        // No clean unit portion – try servingSize
        if (detail.servingSize && detail.servingSizeUnit === 'g') {
            return { grams: detail.servingSize, unitName: `${detail.servingSize}g serving` };
        }
    } catch {
        // fall through to baseline
    }

    return baseline;
}

// ── Step 4: Compute carbs ────────────────────────────────────────────────────
export function getCarbsForQuantity(match: USDAMatch, quantity: number): number {
    // total_carbs = carbs_per_100g * (grams_per_unit * quantity) / 100
    return (match.carbs100g * match.gramsPerUnit * quantity) / 100;
}
