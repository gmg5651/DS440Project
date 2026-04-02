import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { transcript } = await req.json();

        if (!transcript) {
            return Response.json({ error: 'No transcript provided' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      You are a specialized diabetic meal assistant. 
      Analyze the following transcription of a user describing their meal: "${transcript}"
      
      Extract all food items, their quantities, and descriptions.
      
      Return a JSON array of objects with this EXACT structure:
      {
        "name": "detailed food name",
        "quantity": number (e.g. 1.5, 0.75),
        "baseCarbsG": 15 (default placeholder, will be updated by search),
        "carbsG": 15 (default placeholder)
      }

      Rules:
      1. Correct common misspellings (e.g. "tacosi" -> "taco").
      2. Normalize portions (e.g. "two servings" -> quantity: 2).
      3. For fractions, return the decimal (e.g. "3/4" -> 0.75).
      4. If "I had", "I ate", "of a" etc are present, ignore them.
      5. Output ONLY the raw JSON array.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean any markdown formatting if present
        const cleanedJson = text.replace(/```json|```/g, '').trim();
        const items = JSON.parse(cleanedJson);

        return Response.json({ items });
    } catch (error) {
        console.error('Gemini API Route Error:', error);
        return Response.json({ error: 'Failed to parse meal' }, { status: 500 });
    }
}
