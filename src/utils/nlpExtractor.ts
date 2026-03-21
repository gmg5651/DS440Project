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
};

export function extractMealData(utterance: string): ExtractionResult {
    const lower = utterance.toLowerCase();
    const items: FoodItem[] = [];
    let glucose: number | null = null;
    let matched = 0;

    // Extract glucose
    const glucoseMatch = lower.match(/glucose\s+(?:is\s+)?(\d+)/);
    if (glucoseMatch) glucose = parseInt(glucoseMatch[1]);

    // Extract food items
    for (const [key, carbs] of Object.entries(FOOD_DB)) {
        const quantityMatch = lower.match(new RegExp(`(\\d+)\\s+(?:slice[s]?\\s+of\\s+)?${key.split(' ')[0]}`));
        if (lower.includes(key.split(' ')[0])) {
            const qty = quantityMatch ? parseInt(quantityMatch[1]) : 1;
            items.push({ name: key, carbsG: carbs * qty });
            matched++;
        }
    }

    const confidence = matched > 0 || glucose !== null ? 0.85 : 0.2;
    return { items, glucose, confidence };
}
