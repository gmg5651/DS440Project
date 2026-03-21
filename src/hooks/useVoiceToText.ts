import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

export function useVoiceToText() {
    const [status, setStatus] = useState<'idle' | 'listening' | 'done'>('idle');
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (Platform.OS === 'web' && (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
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

                setTranscript(finalTranscript || interimTranscript);
            };

            recog.onstart = () => {
                setStatus('listening');
            };

            recog.onend = () => {
                setStatus('done');
            };

            recog.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'no-speech') {
                    // Ignore no-speech errors to stay listening
                } else {
                    setStatus('idle');
                }
            };

            recognitionRef.current = recog;
        }
    }, []);

    const startRecording = useCallback(() => {
        setTranscript('');
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setStatus('listening');
            } catch (e) {
                console.error('Failed to start recognition', e);
            }
        } else {
            // Fallback for environments without speech API
            setStatus('listening');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setStatus('done');
    }, []);

    return { status, transcript, startRecording, stopRecording };
}
