import React from 'react';
import { render } from '@testing-library/react-native';
import HomeResultsScreen from '@/screens/HomeResultsScreen';

test('renders food items and Calculate Dose CTA', () => {
    const { getByTestId, getByText } = render(<HomeResultsScreen />);
    expect(getByTestId('btn-calculate-dose')).toBeTruthy();
    expect(getByText(/Verification/i)).toBeTruthy();
});
