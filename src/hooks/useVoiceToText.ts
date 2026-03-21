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
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    const current = finalTranscript || interimTranscript;
                    if (current.trim()) {
                        setTranscript(current);
                    }
                };

                recog.onstart = () => {
                    setStatus('listening');
                    setError(null);
                };

                recog.onend = () => {
                    // Only set to done if we were listening
                    setStatus(prev => prev === 'listening' ? 'done' : prev);
                };

                recog.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    if (event.error === 'not-allowed') {
                        setError('Microphone permission denied');
                    } else if (event.error === 'no-speech') {
                        // ignore
                    } else {
                        setError(`Error: ${event.error}`);
                    }
                    setStatus('error');
                };

                recognitionRef.current = recog;
            }
        }
    }, []);

    const startRecording = useCallback(() => {
        setTranscript('');
        setError(null);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setStatus('listening');
            } catch (e) {
                console.error('Failed to start recognition', e);
            }
        } else {
            setStatus('listening');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error('Failed to stop recognition', e);
            }
        }
        setStatus('done');
    }, []);

    return { status, transcript, setTranscript, error, startRecording, stopRecording };
}
