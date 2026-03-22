import React from 'react';
import { render } from '@testing-library/react-native';
import HomeRecordingScreen from '../screens/HomeRecordingScreen';
import { useVoiceToText } from '../hooks/useVoiceToText';

jest.mock('../hooks/useVoiceToText');
jest.mock('../hooks/useAudioLevel', () => ({
    useAudioLevel: () => 0.5,
}));

// Mock Zustand store with selector support
jest.mock('../store/flowStore', () => {
    const mockStore = {
        setTranscript: jest.fn(),
        setExtraction: jest.fn(),
        resetFlow: jest.fn(),
    };
    return {
        useFlowStore: (selector: any) => selector ? selector(mockStore) : mockStore,
    };
});

test('renders stop button and listening text', () => {
    (useVoiceToText as any).mockReturnValue({
        status: 'listening',
        transcript: 'I had a salad',
        stopRecording: jest.fn(),
        startRecording: jest.fn(),
        setTranscript: jest.fn(),
    });

    const { getByTestId, getByText } = render(<HomeRecordingScreen />);
    expect(getByTestId('btn-stop-recording')).toBeTruthy();
    expect(getByText(/listening/i)).toBeTruthy();
});
