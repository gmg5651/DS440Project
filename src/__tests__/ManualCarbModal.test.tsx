import React from 'react';
import { render } from '@testing-library/react-native';
import ManualCarbModal from '@/screens/ManualCarbModal';
import { useFlowStore } from '@/store/flowStore';

// Mock the store
jest.mock('@/store/flowStore', () => ({
    useFlowStore: () => ({
        setFinalItems: jest.fn(),
        setGlucose: jest.fn(),
    }),
}));

test('renders numeric input and save button', () => {
    const { getByTestId } = render(<ManualCarbModal />);
    expect(getByTestId('input-manual-carb')).toBeTruthy();
    expect(getByTestId('btn-save-carb')).toBeTruthy();
});
