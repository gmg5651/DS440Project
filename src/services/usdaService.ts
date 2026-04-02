import Constants from 'expo-constants';

const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export interface USDANutrient {
    nutrientId: number;
    nutrientName: string;
    unitName: string;
    value: number;
}

export interface USDAFoodItem {
    fdcId: number;
    description: string;
    dataType: string;
    foodNutrients: USDANutrient[];
}

export async function searchUSDAFood(query: string): Promise<USDAFoodItem[]> {
    if (!USDA_API_KEY) {
        console.error('USDA API Key missing');
        return [];
    }

    try {
        const response = await fetch(
            `${BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=5&dataType=Foundation,SR Legacy`
        );
        const data = await response.json();
        return data.foods || [];
    } catch (error) {
        console.error('USDA Search Error:', error);
        return [];
    }
}

export function getCarbsFromUSDA(food: USDAFoodItem): number {
    // USDA Nutrient ID for Carbohydrates is 1005
    const carbNutrient = food.foodNutrients.find(n => n.nutrientId === 1005);
    return carbNutrient ? carbNutrient.value : 0;
}
