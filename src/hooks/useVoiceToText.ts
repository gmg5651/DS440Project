import { useState } from 'react';

export function useVoiceToText() {
    const [status, setStatus] = useState<'idle' | 'listening' | 'done'>('idle');
    const [transcript, setTranscript] = useState('');

    const startRecording = () => {
        setStatus('listening');
        setTranscript('');
    };

    const stopRecording = () => {
        setStatus('done');
    };

    return { status, transcript, startRecording, stopRecording };
}
