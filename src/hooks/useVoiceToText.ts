import { useState, useCallback } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export function useVoiceToText() {
    const [status, setStatus] = useState<'idle' | 'listening' | 'done' | 'error'>('idle');
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    useSpeechRecognitionEvent('start', () => {
        console.log('[DEBUG] Speech Recognition Started');
        setStatus('listening');
        setError(null);
    });

    useSpeechRecognitionEvent('end', () => {
        console.log('[DEBUG] Speech Recognition Ended');
    });

    useSpeechRecognitionEvent('result', (event) => {
        // Based on expo-speech-recognition docs, event.results contains the transcripts
        let text = '';
        if (event.results && event.results.length > 0) {
            // For continuous recognition, you might want to combine them or just use the first transcript
            // The library returns an array where results[0].transcript is often the full text.
            text = event.results.map((r: any) => r.transcript).join(' ');
        }
        
        console.log('[DEBUG] Speech Recognition Result:', text);
        if (text.trim()) {
            setTranscript(text);
        }
    });

    useSpeechRecognitionEvent('error', (event) => {
        console.error('[DEBUG] Speech Recognition Error:', event.error, event.message);
        setError(event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setStatus('error');
        }
    });

    const startRecording = useCallback(async () => {
        console.log('[DEBUG] startRecording() called');
        setTranscript('');
        setError(null);

        try {
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!result.granted) {
                console.warn('[DEBUG] Permissions not granted');
                setError('not-allowed');
                setStatus('error');
                return;
            }

            ExpoSpeechRecognitionModule.start({
                lang: 'en-US',
                interimResults: true,
                continuous: true,
            });
        } catch (e: any) {
            console.warn('[DEBUG] start() failed:', e.message);
            setStatus('error');
            setError(e.message);
        }
    }, []);

    const stopRecording = useCallback(() => {
        console.log('[DEBUG] stopRecording() called');
        try {
            ExpoSpeechRecognitionModule.stop();
        } catch (e: any) {
            console.warn('[DEBUG] stop() failed:', e.message);
        }
        setStatus('done');
    }, []);

    return { status, transcript, setTranscript, error, startRecording, stopRecording };
}
