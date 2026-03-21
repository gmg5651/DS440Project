import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { useFlowStore } from '@/store/flowStore';
import { router } from 'expo-router';

export default function HomeRecordingScreen() {
    const { status, transcript, stopRecording } = useVoiceToText();
    const setFlowTranscript = useFlowStore((state) => state.setTranscript);

    const handleStop = () => {
        stopRecording();
        setFlowTranscript(transcript);
        router.push('/results');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{status === 'listening' ? 'Listening...' : 'Processing...'}</Text>

            <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptText}>{transcript || 'Say something like "I had 2 slices of pizza and my glucose is 180"'}</Text>
            </View>

            <View style={[
                styles.pulseIndicator,
                transcript.length > 0 && { transform: [{ scale: 1.2 }], backgroundColor: 'rgba(0,122,255,0.4)' }
            ]} />

            <TouchableOpacity
                style={styles.stopButton}
                testID="btn-stop-recording"
                onPress={handleStop}
            >
                <Text style={styles.stopText}>⏹</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
    transcriptContainer: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12, marginBottom: 48, width: '100%' },
    transcriptText: { fontSize: 18, color: '#fff', textAlign: 'center', fontStyle: 'italic' },
    stopButton: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF3B30',
        justifyContent: 'center', alignItems: 'center', shadowColor: '#FF3B30',
        shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
    },
    stopText: { fontSize: 32 },
    pulseIndicator: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,122,255,0.2)', marginBottom: 48 },
});
