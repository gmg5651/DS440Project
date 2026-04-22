jest.mock('expo-speech', () => ({ speak: jest.fn() }));

import { renderHook, act } from '@testing-library/react-native';
import { useVoiceToText } from '@/hooks/useVoiceToText';

beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

test('initial state is idle', () => {
    const { result } = renderHook(() => useVoiceToText());
    expect(result.current.status).toBe('idle');
    expect(result.current.transcript).toBe('');
});

test('start recording sets status to listening', () => {
    const { result } = renderHook(() => useVoiceToText());
    act(() => result.current.startRecording());
    expect(result.current.status).toBe('listening');
});

test('stop recording sets status to done', () => {
    const { result } = renderHook(() => useVoiceToText());
    act(() => result.current.startRecording());
    act(() => result.current.stopRecording());
    expect(result.current.status).toBe('done');
});
