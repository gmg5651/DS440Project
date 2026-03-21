import React from 'react';
import { render } from '@testing-library/react-native';
import HomeRecordingScreen from '../screens/HomeRecordingScreen';
import { useVoiceToText } from '../hooks/useVoiceToText';

jest.mock('../hooks/useVoiceToText');
jest.mock('../store/flowStore', () => ({
    useFlowStore: () => ({
        setTranscript: jest.fn(),
    }),
}));

test('renders stop button and listening text', () => {
    (useVoiceToText as any).mockReturnValue({
        status: 'listening',
        transcript: 'I had a salad',
        stopRecording: jest.fn(),
    });

    const { getByTestId, getByText } = render(<HomeRecordingScreen />);
    expect(getByTestId('btn-stop-recording')).toBeTruthy();
    expect(getByText(/listening/i)).toBeTruthy();
});
