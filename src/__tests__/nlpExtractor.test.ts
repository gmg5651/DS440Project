import { segmentMeal } from '@/utils/nlpExtractor';

test('segments pizza utterance', () => {
    const result = segmentMeal('I had two slices of pepperoni pizza');
    expect(result.segments.some(s => s.name.toLowerCase().includes('pizza'))).toBe(true);
    expect(result.segments[0].quantity).toBe(2);
});

it('extracts glucose reading', () => {
    const res = segmentMeal('glucose 180');
    expect(res.glucose).toBe(180);
});

it('handles 3/4 of a banana and 1.5 apples', () => {
    const res = segmentMeal('3/4 of a banana and 1.5 apples');
    expect(res.segments).toHaveLength(2);
    expect(res.segments[0].quantity).toBe(0.75);
    expect(res.segments[0].name).toBe('banana');
    expect(res.segments[1].quantity).toBe(1.5);
    expect(res.segments[1].name).toBe('apples');
});

it('handles numerical fractions like 2/3', () => {
    const res = segmentMeal('2/3 cups of milk');
    expect(res.segments[0].quantity).toBeCloseTo(0.666, 2);
    expect(res.segments[0].name).toBe('cups of milk');
});

it('handles fractions like half and quarter', () => {
    const res = segmentMeal('a half cup of milk');
    expect(res.segments[0].quantity).toBe(0.5);
    expect(res.segments[0].name).toBe('cup of milk');
});

test('returns low confidence flag on ambiguous input', () => {
    const result = segmentMeal('stuff');
    expect(result.confidence).toBeLessThan(0.4);
});
