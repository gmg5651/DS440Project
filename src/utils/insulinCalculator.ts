interface DoseInput {
    totalCarbsG: number;
    glucoseMgDl: number;
    icr: number;
    isf: number;
    targetGlucose: number;
    isfThreshold?: number;
    maxDose?: number;
    roundingMode?: 'none' | 'half' | 'whole';
}
interface DoseResult {
    mealDose: number;
    correctionDose: number;
    totalDose: number;
    isCapped: boolean;
}

export function calculateDose(input: DoseInput): DoseResult {
    const mealDose = input.totalCarbsG / input.icr;

    // Correction only if at or above threshold (or target if no threshold)
    const threshold = input.isfThreshold || input.targetGlucose;
    let correctionDose = 0;
    if (input.glucoseMgDl >= threshold) {
        correctionDose = (input.glucoseMgDl - input.targetGlucose) / input.isf;
    }

    let total = mealDose + correctionDose;
    let isCapped = false;

    // Apply Max Dose Safety Cap
    if (input.maxDose && total > input.maxDose) {
        total = input.maxDose;
        isCapped = true;
    }

    // Apply Rounding
    if (input.roundingMode === 'half') {
        total = Math.round(total * 2) / 2;
    } else if (input.roundingMode === 'whole') {
        total = Math.round(total);
    }

    return {
        mealDose,
        correctionDose,
        totalDose: total,
        isCapped
    };
}
