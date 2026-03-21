import React from 'react';
import { render } from '@testing-library/react-native';
import DoseModal from '@/screens/DoseModal';

test('renders dose breakdown and Confirm CTA', () => {
    const { getByTestId, getByText } = render(<DoseModal />);
    expect(getByTestId('btn-confirm-dose')).toBeTruthy();
    expect(getByText(/Meal Dose/i)).toBeTruthy();
    expect(getByText(/Correction Dose/i)).toBeTruthy();
});
