import { segmentMeal } from '@/utils/nlpExtractor';

test('segments pizza utterance', () => {
    const result = segmentMeal('I had two slices of pepperoni pizza');
    expect(result.segments.some(s => s.name.toLowerCase().includes('pizza'))).toBe(true);
    expect(result.segments[0].quantity).toBe(2);
});

test('extracts glucose reading', () => {
    const result = segmentMeal('my glucose is 180');
    expect(result.glucose).toBe(180);
});

test('returns low confidence flag on ambiguous input', () => {
    const result = segmentMeal('stuff');
    expect(result.confidence).toBeLessThan(0.4);
});
