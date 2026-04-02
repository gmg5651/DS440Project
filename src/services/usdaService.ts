import { calculateSimilarity } from '@/utils/stringSimilarity';

const API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export interface USDAMatch {
    name: string;
    fdcId: number;
    score: number;
    carbs100g: number;
}

export async function searchUSDAFood(query: string): Promise<USDAMatch | null> {
    if (!API_KEY) throw new Error('USDA API Key missing');

    const searchUrl = `${BASE_URL}/foods/search?api_key=${API_KEY}`;

    const response = await fetch(searchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: query,
            pageSize: 15,
            dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)"] // Expanding slightly but prioritizing properly
        })
    });

    if (!response.ok) throw new Error(`USDA Search failed: ${response.status}`);

    const data = await response.json();
    const foods = data.foods || [];

    if (foods.length === 0) return null;

    // 1. Rank by similarity and priority
    const candidates = foods.map((f: any) => {
        const similarity = calculateSimilarity(query, f.description);

        // Priority weight: Foundation > SR Legacy > Survey
        let priority = 1;
        if (f.dataType === 'Foundation') priority = 1.3;
        else if (f.dataType === 'SR Legacy') priority = 1.1;

        const totalScore = similarity * priority;

        // 2. Extract Carbohydrate nutrient
        const carbNutrient = f.foodNutrients?.find((n: any) =>
            n.nutrientName?.toLowerCase().includes('carbohydrate, by difference')
        );

        return {
            name: f.description,
            fdcId: f.fdcId,
            score: totalScore,
            carbs100g: carbNutrient ? carbNutrient.value : 0
        };
    });

    // 3. Return the best candidate
    candidates.sort((a: USDAMatch, b: USDAMatch) => b.score - a.score);
    return candidates[0];
}

export function getCarbsForQuantity(match: USDAMatch, quantity: number): number {
    // Standard USDA data is per 100g. 
    // We'll treat 1 "unit" from our segmenter as 100g for base measurement
    // unless it's a known unit-based food.
    // FOR NOW: Assume 'quantity' is the number of 100g units, or just apply it directly
    // since the user's segments are like "two muffins".
    // 1 standard muffin is approx 60-100g. 
    // This is the hardest part without an LLM: mapping "muffin" -> grams.
    // IMPROVEMENT: If name contains 'unit' or similar, handle differently.
    return match.carbs100g * quantity;
}
