import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

export function useVoiceToText() {
    const [status, setStatus] = useState<'idle' | 'listening' | 'done' | 'error'>('idle');
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (Platform.OS === 'web') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recog = new SpeechRecognition();
                recog.continuous = true;
                recog.interimResults = true;
                recog.lang = 'en-US';

                recog.onresult = (event: any) => {
                    let text = '';
                    for (let i = 0; i < event.results.length; i++) {
                        text += event.results[i][0].transcript;
                    }
                    console.log('[DEBUG] Speech Recognition Result:', text);
                    if (text.trim()) {
                        setTranscript(text);
                    }
                };

                recog.onstart = () => {
                    console.log('[DEBUG] Speech Recognition Started');
                    setStatus('listening');
                    setError(null);
                };

                recog.onend = () => {
                    console.log('[DEBUG] Speech Recognition Ended');
                };

                recog.onerror = (event: any) => {
                    console.error('[DEBUG] Speech Recognition Error:', event.error);
                    setError(event.error);
                    if (event.error === 'not-allowed') {
                        setStatus('error');
                    }
                };

                recognitionRef.current = recog;
            } else {
                console.warn('[DEBUG] Speech Recognition NOT supported');
                setError('browser-unsupported');
            }
        }
    }, []);

    const startRecording = useCallback(() => {
        console.log('[DEBUG] startRecording() called');
        setTranscript('');
        setError(null);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setStatus('listening');
            } catch (e: any) {
                console.warn('[DEBUG] start() failed:', e.message);
                // If already started, just set status
            }
        } else {
            console.warn('[DEBUG] No recognition instance available');
            setStatus('listening');
        }
    }, []);

    const stopRecording = useCallback(() => {
        console.log('[DEBUG] stopRecording() called');
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e: any) {
                console.warn('[DEBUG] stop() failed:', e.message);
            }
        }
        setStatus('done');
    }, []);

    return { status, transcript, setTranscript, error, startRecording, stopRecording };
}
