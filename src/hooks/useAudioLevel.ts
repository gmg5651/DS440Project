import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useAudioLevel(active: boolean) {
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        if (!active || Platform.OS !== 'web') return;

        let audioContext: AudioContext;
        let analyser: AnalyserNode;
        let microphone: MediaStreamAudioSourceNode;
        let javascriptNode: ScriptProcessorNode;

        async function startAudio() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

                analyser.smoothingTimeConstant = 0.8;
                analyser.fftSize = 1024;

                microphone.connect(analyser);
                analyser.connect(javascriptNode);
                javascriptNode.connect(audioContext.destination);

                javascriptNode.onaudioprocess = () => {
                    const array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);
                    let values = 0;
                    for (let i = 0; i < array.length; i++) {
                        values += array[i];
                    }
                    const average = values / array.length;
                    setVolume(average);
                };
            } catch (e) {
                console.error('Audio capture failed:', e);
            }
        }

        startAudio();

        return () => {
            if (audioContext) audioContext.close();
            setVolume(0);
        };
    }, [active]);

    return volume;
}
