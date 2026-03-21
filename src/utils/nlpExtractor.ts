export interface FoodItem { name: string; carbsG: number; }
export interface ExtractionResult {
    items: FoodItem[];
    glucose: number | null;
    confidence: number;
}

// Phase 1: curated regex lookup. Replace with API call when online.
const FOOD_DB: Record<string, number> = {
    'pizza slice': 26,
    'soda': 23,
    'apple': 25,
    'banana': 27,
    'rice cup': 45,
    'taco': 18,
    'bread': 15,
};

export function extractMealData(utterance: string): ExtractionResult {
    const lower = utterance.toLowerCase().trim();
    if (!lower) return { items: [], glucose: null, confidence: 0 };

    const items: FoodItem[] = [];
    let glucose: number | null = null;
    let isDbMatch = false;

    // Extract glucose
    const glucoseMatch = lower.match(/(?:glucose|sugar|level)\s+(?:is\s+)?(\d+)/) || lower.match(/(\d+)\s+(?:mg\/dl|mgdl)/);
    if (glucoseMatch) glucose = parseInt(glucoseMatch[1]);

    // Extract food items from DB
    for (const [key, carbs] of Object.entries(FOOD_DB)) {
        const keyword = key.split(' ')[0];
        const quantityMatch = lower.match(new RegExp(`(\\d+)\\s+(?:slice[s]?\\s+of\\s+)?${keyword}`));

        if (lower.includes(keyword)) {
            const qty = quantityMatch ? parseInt(quantityMatch[1]) : 1;
            items.push({ name: key, carbsG: carbs * qty });
            isDbMatch = true;
        }
    }

    // Fallback: If no items found but text exists, treat the whole thing as a generic entry for the demo
    let isFallback = false;
    if (items.length === 0 && lower.length > 2) {
        const leadQtyMatch = lower.match(/^(\d+)\s+(.+)/);
        const name = leadQtyMatch ? leadQtyMatch[2] : lower;
        const qty = leadQtyMatch ? parseInt(leadQtyMatch[1]) : 1;

        items.push({
            name: name.substring(0, 30),
            carbsG: 20 * qty
        });
        isFallback = true;
    }

    let confidence = 0.1;
    if (isDbMatch || glucose !== null) confidence = 0.85;
    else if (isFallback) confidence = 0.4;

    return { items, glucose, confidence };
}
