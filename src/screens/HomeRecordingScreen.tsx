import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { useAudioLevel } from '@/hooks/useAudioLevel';
import { useFlowStore } from '@/store/flowStore';
import { router } from 'expo-router';

export default function HomeRecordingScreen() {
    const { status, transcript, setTranscript, error, stopRecording, startRecording } = useVoiceToText();
    const volume = useAudioLevel(status === 'listening');
    const setFlowTranscript = useFlowStore((state) => state.setTranscript);
    const resetFlow = useFlowStore((state) => state.resetFlow);
    const [isSecure, setIsSecure] = React.useState(true);

    React.useEffect(() => {
        resetFlow(); // Ensure state is clean
        startRecording();

        if (Platform.OS === 'web' && !window.isSecureContext) {
            setIsSecure(false);
        }
    }, []);

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
            {!isSecure && (
                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>⚠️ Voice requires HTTPS or localhost. Please use http://localhost:8081 for the demo.</Text>
                </View>
            )}
            <View style={styles.debugHeader}>
                <Text style={styles.debugText}>Status: {status.toUpperCase()}</Text>
                {error && <Text style={styles.errorText}>Error: {error}</Text>}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" style={{ flex: 1, width: '100%' }}>
                <Text style={styles.title}>
                    {status === 'listening' ? 'Speak Food Items...' : 'Processing...'}
                </Text>

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

                <View style={styles.visualizerContainer}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.visualizerBar,
                                { height: status === 'listening' ? 10 + (Math.random() * 30 * (transcript.length > 0 ? 1.5 : 1)) : 10 }
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.stopButton}
                    testID="btn-stop-recording"
                    onPress={handleStop}
                >
                    <Text style={styles.stopText}>⏹ Finish & Verify</Text>
                </TouchableOpacity>

                {status === 'error' && (
                    <TouchableOpacity onPress={startRecording} style={styles.retryButton}>
                        <Text style={styles.retryText}>Retry Microphone</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        paddingTop: 100, // space for absolute elements
    },
    debugHeader: {
        position: 'absolute',
        top: 60,
        alignItems: 'center',
    },
    debugText: {
        color: '#444',
        fontSize: 10,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
    },
    transcriptContainer: {
        backgroundColor: '#1c1c1e',
        padding: 24,
        borderRadius: 24,
        marginBottom: 32,
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
    visualizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        marginBottom: 40,
        gap: 6,
    },
    visualizerBar: {
        width: 4,
        backgroundColor: '#007AFF',
        borderRadius: 2,
    },
    stopButton: {
        paddingVertical: 18,
        paddingHorizontal: 50,
        borderRadius: 35,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    stopText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    retryButton: {
        marginTop: 20,
        padding: 10,
    },
    retryText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    warningBox: {
        position: 'absolute',
        top: 20,
        backgroundColor: '#FF9500',
        padding: 15,
        borderRadius: 12,
        margin: 20,
        zIndex: 100,
    },
    warningText: {
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
