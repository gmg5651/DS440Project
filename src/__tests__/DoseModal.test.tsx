import React from 'react';
import { render } from '@testing-library/react-native';
import DoseModal from '../screens/DoseModal';
import { useFlowStore } from '../store/flowStore';

// Mock the stores
jest.mock('../store/flowStore');
jest.mock('../store/settingsStore', () => ({
    useSettingsStore: () => ({
        icr: 10,
        isf: 50,
        targetGlucose: 100,
    }),
}));

test('renders dose breakdown and Confirm CTA', () => {
    (useFlowStore as any).mockReturnValue({
        extraction: {
            items: [{ name: 'Pizza', carbsG: 50 }],
            glucose: 150,
        },
        resetFlow: jest.fn(),
    });

    const { getByTestId, getByText } = render(<DoseModal />);
    expect(getByTestId('btn-confirm-dose')).toBeTruthy();
    expect(getByText(/Meal Dose/i)).toBeTruthy();
    expect(getByText(/Correction Dose/i)).toBeTruthy();
});
