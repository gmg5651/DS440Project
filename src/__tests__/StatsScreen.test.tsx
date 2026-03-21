import React from 'react';
import { render } from '@testing-library/react-native';
import StatsScreen from '@/screens/StatsScreen';

test('renders stats summary data', () => {
    const { getByText } = render(<StatsScreen />);
    expect(getByText(/Avg Glucose/i)).toBeTruthy();
    expect(getByText(/Total Insulin/i)).toBeTruthy();
});
