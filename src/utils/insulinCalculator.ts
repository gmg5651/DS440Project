interface DoseInput {
    totalCarbsG: number;
    glucoseMgDl: number;
    icr: number;
    isf: number;
    targetGlucose: number;
}
interface DoseResult {
    mealDose: number;
    correctionDose: number;
    totalDose: number;
}

export function calculateDose(input: DoseInput): DoseResult {
    const mealDose = input.totalCarbsG / input.icr;
    const correctionDose = Math.max(0, (input.glucoseMgDl - input.targetGlucose) / input.isf);
    return { mealDose, correctionDose, totalDose: mealDose + correctionDose };
}
