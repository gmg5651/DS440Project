import React from 'react';
import { render } from '@testing-library/react-native';
import HomeRecordingScreen from '@/screens/HomeRecordingScreen';

test('renders stop button and listening text', () => {
    const { getByTestId, getByText } = render(<HomeRecordingScreen />);
    expect(getByTestId('btn-stop-recording')).toBeTruthy();
    expect(getByText(/listening/i)).toBeTruthy();
});
