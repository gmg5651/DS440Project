import React from 'react';
import { render } from '@testing-library/react-native';
import DoseModal from '../screens/DoseModal';
import { useFlowStore } from '../store/flowStore';
import { useSettingsStore } from '../store/settingsStore';

// Mock the stores
jest.mock('../store/flowStore');
jest.mock('../store/settingsStore');

test('renders dose breakdown and Confirm CTA', () => {
    (useFlowStore as any).mockReturnValue({
        finalItems: [{ name: 'Pizza', carbsG: 50, quantity: 1, baseCarbsG: 50 }],
        glucose: 150,
        icr: null,
        resetFlow: jest.fn(),
    });

    // 1. Without correction (glucose 150 < 151)
    (useSettingsStore as any).mockReturnValue({
        icr: 10,
        isf: 50,
        targetGlucose: 100,
        isfThreshold: 151,
        maxDose: 15,
        roundingMode: 'half',
    });

    const { getByText, rerender, queryByText } = render(<DoseModal />);

    expect(getByText(/Meal Dose/i)).toBeTruthy();
    expect(getByText(/5.00/i)).toBeTruthy();
    expect(getByText(/Correction Dose/i)).toBeTruthy();
    expect(getByText(/0.00/i)).toBeTruthy();
    // Total should be 5.0 (rounded)
    expect(getByText(/^5.0\s+U$/)).toBeTruthy();

    // 2. With correction (threshold 150 <= glucose 150)
    (useSettingsStore as any).mockReturnValue({
        icr: 10,
        isf: 50,
        targetGlucose: 100,
        isfThreshold: 150,
        maxDose: 15,
        roundingMode: 'half',
    });

    rerender(<DoseModal />);
    expect(getByText(/1.00/i)).toBeTruthy(); // Correction dose
    expect(getByText(/^6.0\s+U$/)).toBeTruthy(); // 5 + 1
});
