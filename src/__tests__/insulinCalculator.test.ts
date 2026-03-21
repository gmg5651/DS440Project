import { calculateDose } from '@/utils/insulinCalculator';

test('calculates meal dose correctly', () => {
    // 75g carbs / ICR of 10 = 7.5 units
    const result = calculateDose({ totalCarbsG: 75, glucoseMgDl: 100, icr: 10, isf: 50, targetGlucose: 100 });
    expect(result.mealDose).toBeCloseTo(7.5);
});

test('calculates correction dose when glucose > target', () => {
    // (210 - 100) / ISF 50 = 2.2 units
    const result = calculateDose({ totalCarbsG: 0, glucoseMgDl: 210, icr: 10, isf: 50, targetGlucose: 100 });
    expect(result.correctionDose).toBeCloseTo(2.2);
});

test('correction dose is 0 when glucose is at target', () => {
    const result = calculateDose({ totalCarbsG: 0, glucoseMgDl: 100, icr: 10, isf: 50, targetGlucose: 100 });
    expect(result.correctionDose).toBe(0);
});

test('total dose is sum of meal and correction', () => {
    const result = calculateDose({ totalCarbsG: 75, glucoseMgDl: 210, icr: 10, isf: 50, targetGlucose: 100 });
    expect(result.totalDose).toBeCloseTo(result.mealDose + result.correctionDose);
});
