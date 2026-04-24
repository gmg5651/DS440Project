import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export function useVoiceToText() {
    const [status, setStatus] = useState<'idle' | 'listening' | 'done' | 'error'>('idle');
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // Lifecycle tracking
    const isRecordingRequested = useRef(false);
    const isCurrentlyListening = useRef(false);
    const accumulatedTranscriptRef = useRef('');
    const lastSessionTextRef = useRef('');
    
    // Web-specific recognition instance (restored for stability)
    const webRecognitionRef = useRef<any>(null);

    useEffect(() => {
        console.log('[DEBUG] useVoiceToText hook mounted (Platform:', Platform.OS, ')');
        
        // Initialize Web Speech API if on web
        if (Platform.OS === 'web') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recog = new SpeechRecognition();
                recog.continuous = true;
                recog.interimResults = true;
                recog.lang = 'en-US';

                recog.onstart = () => {
                    console.log('[DEBUG] Web Speech Started');
                    isCurrentlyListening.current = true;
                    setStatus('listening');
                    setError(null);
                    lastSessionTextRef.current = '';
                };

                recog.onresult = (event: any) => {
                    let sessionText = '';
                    // Web API provides the full list of results for the current session
                    for (let i = 0; i < event.results.length; i++) {
                        sessionText += event.results[i][0].transcript;
                    }
                    console.log('[DEBUG] Web Speech Result:', sessionText);
                    lastSessionTextRef.current = sessionText;
                    
                    // Display accumulated text + current session text
                    const base = accumulatedTranscriptRef.current.trim();
                    const current = sessionText.trim();
                    setTranscript(base ? `${base} ${current}` : current);
                };

                recog.onend = () => {
                    console.log('[DEBUG] Web Speech Ended. Requested:', isRecordingRequested.current);
                    isCurrentlyListening.current = false;
                    
                    // Commit this session's text to the accumulator
                    const currentText = lastSessionTextRef.current.trim();
                    if (currentText) {
                        const base = accumulatedTranscriptRef.current.trim();
                        accumulatedTranscriptRef.current = base ? `${base} ${currentText}` : currentText;
                        lastSessionTextRef.current = '';
                    }

                    if (isRecordingRequested.current) {
                        try { recog.start(); } catch (e) { /* already started */ }
                    } else {
                        setStatus('done');
                    }
                };

                recog.onerror = (event: any) => {
                    console.error('[DEBUG] Web Speech Error:', event.error);
                    if (event.error === 'not-allowed') {
                        setError('Permission denied');
                        isRecordingRequested.current = false;
                    }
                    setStatus('error');
                };

                webRecognitionRef.current = recog;
            } else {
                console.warn('[DEBUG] Browser does not support SpeechRecognition');
            }
        }

        return () => {
            console.log('[DEBUG] useVoiceToText hook unmounted');
            isRecordingRequested.current = false;
            try {
                if (Platform.OS === 'web' && webRecognitionRef.current) {
                    webRecognitionRef.current.stop();
                } else {
                    ExpoSpeechRecognitionModule.stop();
                }
            } catch (e) {}
        };
    }, []);

    // --- Native (expo-speech-recognition) Listeners ---
    
    useSpeechRecognitionEvent('start', () => {
        if (Platform.OS === 'web') return; // Handled by native Web API listener
        console.log('[DEBUG] Native Speech Started');
        isCurrentlyListening.current = true;
        setStatus('listening');
        setError(null);
        lastSessionTextRef.current = '';
    });

    useSpeechRecognitionEvent('end', () => {
        if (Platform.OS === 'web') return;
        isCurrentlyListening.current = false;
        
        const currentText = lastSessionTextRef.current.trim();
        if (currentText) {
            const base = accumulatedTranscriptRef.current.trim();
            accumulatedTranscriptRef.current = base ? `${base} ${currentText}` : currentText;
            lastSessionTextRef.current = '';
        }

        console.log('[DEBUG] Native Speech Ended. Requested:', isRecordingRequested.current);
        if (isRecordingRequested.current) {
            startRecognitionInternal();
        } else {
            setStatus('done');
        }
    });

    useSpeechRecognitionEvent('result', (event) => {
        if (Platform.OS === 'web') return;
        let sessionText = '';
        if (event.results && event.results.length > 0) {
            sessionText = event.results.map((r: any) => r.transcript).join(' ');
        }
        
        console.log('[DEBUG] Native Speech Result:', sessionText);
        lastSessionTextRef.current = sessionText;

        const base = accumulatedTranscriptRef.current.trim();
        const current = sessionText.trim();
        setTranscript(base ? `${base} ${current}` : current);
    });

    useSpeechRecognitionEvent('error', (event) => {
        if (Platform.OS === 'web') return;
        console.error('[DEBUG] Native Speech Error:', event.error);
        setError(event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setStatus('error');
            isRecordingRequested.current = false;
        }
    });

    // --- Control Functions ---

    const startRecognitionInternal = async () => {
        if (isCurrentlyListening.current) return;
        try {
            if (Platform.OS === 'web' && webRecognitionRef.current) {
                webRecognitionRef.current.start();
            } else if (Platform.OS !== 'web') {
                ExpoSpeechRecognitionModule.start({
                    lang: 'en-US',
                    interimResults: true,
                    continuous: true,
                });
            }
        } catch (e: any) {
            console.warn('[DEBUG] start() failed:', e.message);
            setStatus('error');
            setError(e.message);
        }
    };

    const startRecording = useCallback(async () => {
        console.log('[DEBUG] startRecording() requested');
        setTranscript('');
        accumulatedTranscriptRef.current = '';
        lastSessionTextRef.current = '';
        setError(null);
        isRecordingRequested.current = true;

        if (Platform.OS === 'web') {
            await startRecognitionInternal();
        } else {
            try {
                const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
                if (!result.granted) {
                    setError('not-allowed');
                    setStatus('error');
                    isRecordingRequested.current = false;
                    return;
                }
                await startRecognitionInternal();
            } catch (e: any) {
                setStatus('error');
                setError(e.message);
                isRecordingRequested.current = false;
            }
        }
    }, []);

    const stopRecording = useCallback(() => {
        console.log('[DEBUG] stopRecording() requested');
        isRecordingRequested.current = false;
        try {
            if (Platform.OS === 'web' && webRecognitionRef.current) {
                webRecognitionRef.current.stop();
            } else {
                ExpoSpeechRecognitionModule.stop();
            }
        } catch (e) {}
        setStatus('done');
    }, []);

    const manualSetTranscript = useCallback((text: string) => {
        setTranscript(text);
        accumulatedTranscriptRef.current = text;
        lastSessionTextRef.current = '';
    }, []);

    return { 
        status, 
        transcript, 
        setTranscript: manualSetTranscript, 
        error, 
        startRecording, 
        stopRecording 
    };
}
