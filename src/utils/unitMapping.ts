
export interface UnitWeight {
    grams: number;
    unitName: string;
}

/**
 * Unit Mapping Layer:
 * Maps common natural language food items to their standard USDA "item" weights (in grams).
 * Reference: USDA FoodData Central (FDC) 'Standard Weight' or 'Common measures'.
 */
const FOOD_UNIT_WEIGHTS: Record<string, UnitWeight> = {
    'banana': { grams: 118, unitName: 'medium banana' },
    'apple': { grams: 182, unitName: 'large apple' },
    'egg': { grams: 50, unitName: 'large egg' },
    'slice of bread': { grams: 28, unitName: 'one slice' },
    'bread': { grams: 28, unitName: 'one slice' },
    'orange': { grams: 131, unitName: 'medium orange' },
    'muffin': { grams: 100, unitName: 'one muffin' },
    'taco': { grams: 100, unitName: 'one taco' },
    'pizza': { grams: 107, unitName: 'one slice' },
    'cup of coffee': { grams: 240, unitName: 'one cup' },
    'coffee': { grams: 240, unitName: 'one cup' },
    'milk': { grams: 240, unitName: 'one cup' },
    'yogurt': { grams: 170, unitName: 'one container' },
    'pear': { grams: 178, unitName: 'medium pear' },
    'peach': { grams: 150, unitName: 'medium peach' },
    'chicken breast': { grams: 174, unitName: 'one breast' },
    'chicken': { grams: 174, unitName: 'one breast' },
    'avocado': { grams: 201, unitName: 'one avocado' },
    'potato': { grams: 213, unitName: 'one potato' },
    'sweet potato': { grams: 130, unitName: 'one sweet potato' },
};

/**
 * Returns the estimated grams for a single 'unit' of the given food.
 * Falls back to 100g if unknown.
 */
export function getGramsPerUnit(foodName: string): UnitWeight {
    const lower = foodName.toLowerCase().trim();

    // Check for exact matches
    if (FOOD_UNIT_WEIGHTS[lower]) return FOOD_UNIT_WEIGHTS[lower];

    // Check for plural/singular matches
    const singular = lower.endsWith('s') ? lower.slice(0, -1) : lower;
    if (FOOD_UNIT_WEIGHTS[singular]) return FOOD_UNIT_WEIGHTS[singular];

    // Check if any mapping word is in the food name (e.g. "Bananas, overripe, raw")
    const keys = Object.keys(FOOD_UNIT_WEIGHTS);
    for (const key of keys) {
        if (lower.includes(key)) return FOOD_UNIT_WEIGHTS[key];
    }

    // Default fallback: 100g (USDA standard portion per 100g)
    return { grams: 100, unitName: '100g' };
}
