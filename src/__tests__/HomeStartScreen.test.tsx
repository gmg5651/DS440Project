import React from 'react';
import { render } from '@testing-library/react-native';
import HomeStartScreen from '@/screens/HomeStartScreen';

test('renders microphone button', () => {
    const { getByTestId } = render(<HomeStartScreen />);
    expect(getByTestId('btn-start-recording')).toBeTruthy();
});
