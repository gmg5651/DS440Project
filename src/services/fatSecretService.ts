import Constants from 'expo-constants';

const CLIENT_ID = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID || Constants.expoConfig?.extra?.fatSecretClientId;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET || Constants.expoConfig?.extra?.fatSecretClientSecret;

const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const API_BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string> {
    if (accessToken && Date.now() < tokenExpiresAt) {
        return accessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('FatSecret credentials missing. Check your .env file or Expo config.');
    }

    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=basic',
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('FatSecret Auth Error:', err);
        throw new Error('Failed to authenticate with FatSecret');
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000; // Buffer of 1 minute
    return accessToken!;
}

export interface FatSecretFood {
    food_id: string;
    food_name: string;
    food_description: string;
}

export interface FatSecretNutrients {
    calories: number;
    carbohydrate: number;
    protein: number;
    fat: number;
}

export interface FinalFoodItem {
    name: string;
    carbsG: number;
    quantity: number;
    baseCarbsG: number;
}

export async function searchFood(query: string): Promise<FatSecretFood[]> {
    const token = await getAccessToken();
    const params = new URLSearchParams({
        method: 'foods.search',
        search_expression: query,
        format: 'json',
        max_results: '5',
    });

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('FatSecret search failed');

    const data = await response.json();
    return data.foods?.food || [];
}

export async function getFoodDetails(foodId: string): Promise<FatSecretNutrients | null> {
    const token = await getAccessToken();
    const params = new URLSearchParams({
        method: 'food.get.v2',
        food_id: foodId,
        format: 'json',
    });

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('FatSecret details failed');

    const data = await response.json();
    const servings = data.food?.servings?.serving;

    if (!servings) return null;

    const serving = Array.isArray(servings) ? servings[0] : servings;

    return {
        calories: parseFloat(serving.calories),
        carbohydrate: parseFloat(serving.carbohydrate),
        protein: parseFloat(serving.protein),
        fat: parseFloat(serving.fat),
    };
}

export async function parseNaturalLanguage(input: string): Promise<FinalFoodItem[]> {
    const token = await getAccessToken();

    const bodyParams = new URLSearchParams({
        method: 'natural_language_processing.v1',
        user_input: input,
        format: 'json',
        include_food_data: 'true',
    });

    console.log('[DEBUG] FatSecret NLP Request:', input);
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('FatSecret NLP Error Body:', err);
        throw new Error(`FatSecret NLP failed: ${response.status} ${err}`);
    }

    const data = await response.json();
    const foods = data.foods?.food;

    if (!foods) return [];

    const items = Array.isArray(foods) ? foods : [foods];

    return items.map((f: any) => {
        const servings = f.servings?.serving;
        const serving = Array.isArray(servings) ? servings[0] : servings;

        const totalCarbs = parseFloat(serving?.carbohydrate || '0');
        const qty = parseFloat(serving?.number_of_units || '1');

        return {
            name: f.food_name,
            carbsG: totalCarbs,
            quantity: qty,
            baseCarbsG: qty > 0 ? totalCarbs / qty : totalCarbs
        };
    });
}
