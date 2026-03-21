import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import StatsScreen from '../screens/StatsScreen';

// All DB calls are mocked in jest-setup.ts
test('renders stats summary data', async () => {
    const { getByText } = render(<StatsScreen />);

    await waitFor(() => {
        expect(getByText(/Avg Glucose/i)).toBeTruthy();
        expect(getByText(/Total Insulin/i)).toBeTruthy();
    });
});
