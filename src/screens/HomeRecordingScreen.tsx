import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { useFlowStore } from '@/store/flowStore';
import { router } from 'expo-router';

export default function HomeRecordingScreen() {
    const { status, transcript, setTranscript, error, stopRecording, startRecording } = useVoiceToText();
    const setFlowTranscript = useFlowStore((state) => state.setTranscript);

    const handleStop = () => {
        stopRecording();
        setFlowTranscript(transcript);
        router.push('/results');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Text style={styles.title}>
                {status === 'listening' ? 'Listening...' : status === 'error' ? 'Voice Error' : 'Processing...'}
            </Text>

            {error && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={startRecording}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.transcriptContainer}>
                <TextInput
                    style={styles.transcriptInput}
                    multiline
                    placeholder='Describe your meal (e.g. "I had a salad and a coke")'
                    placeholderTextColor="#666"
                    value={transcript}
                    onChangeText={setTranscript}
                    autoFocus
                />
            </View>

            <View style={[
                styles.pulseIndicator,
                transcript.length > 0 && { transform: [{ scale: 1.1 }], backgroundColor: 'rgba(0,122,255,0.4)' }
            ]} />

            <TouchableOpacity
                style={styles.stopButton}
                testID="btn-stop-recording"
                onPress={handleStop}
            >
                <Text style={styles.stopText}>⏹ Done</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20
    },
    errorBox: {
        backgroundColor: 'rgba(255,59,48,0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center'
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginBottom: 4
    },
    retryText: {
        color: '#007AFF',
        fontWeight: 'bold'
    },
    transcriptContainer: {
        backgroundColor: '#1c1c1e',
        padding: 24,
        borderRadius: 16,
        marginBottom: 40,
        width: '100%',
        minHeight: 180,
        borderWidth: 1,
        borderColor: '#3a3a3c',
        zIndex: 10,
    },
    transcriptInput: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        fontStyle: 'italic',
        height: '100%',
        paddingTop: 0,
    },
    pulseIndicator: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,122,255,0.2)',
        marginBottom: 40
    },
    stopButton: {
        paddingVertical: 16,
        paddingHorizontal: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF', // Changed to blue to signal "Proceed"
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
});
