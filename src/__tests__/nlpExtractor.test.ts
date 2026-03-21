import { extractMealData } from '@/utils/nlpExtractor';

test('extracts carbs from pizza utterance', () => {
    const result = extractMealData('I had two slices of pepperoni pizza');
    expect(result.items.some(i => i.name.toLowerCase().includes('pizza'))).toBe(true);
});

test('extracts glucose reading', () => {
    const result = extractMealData('my glucose is 180');
    expect(result.glucose).toBe(180);
});

test('returns low confidence flag on ambiguous input', () => {
    const result = extractMealData('stuff');
    expect(result.confidence).toBeLessThan(0.5);
});
