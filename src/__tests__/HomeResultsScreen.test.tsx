import React from 'react';
import { render } from '@testing-library/react-native';
import HomeResultsScreen from '@/screens/HomeResultsScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

test('renders Verification title and Calculate Dose CTA', () => {
    const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
            <HomeResultsScreen />
        </QueryClientProvider>
    );
    expect(getByTestId('btn-calculate-dose')).toBeTruthy();
    expect(getByText(/Verification/i)).toBeTruthy();
});
