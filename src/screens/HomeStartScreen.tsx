import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { useFlowStore } from '@/store/flowStore';

export default function HomeStartScreen() {
    const { startRecording } = useVoiceToText();
    const resetFlow = useFlowStore(state => state.resetFlow);

    const handleStart = () => {
        resetFlow();
        startRecording();
        router.push('/recording');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Swiftulin</Text>
            <Text style={styles.subtitle}>Tap to log a meal or dose</Text>

            <TouchableOpacity
                style={styles.micButton}
                testID="btn-start-recording"
                onPress={handleStart}>
                <Text style={styles.micIcon}>🎙️</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.manualButton}
                onPress={() => router.push('/manual-carb')}>
                <Text style={styles.manualText}>⌨️ Manual Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.statsButton}
                onPress={() => router.push('/stats')}>
                <Text style={styles.statsIcon}>📊 View Stats</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#888',
        marginBottom: 60,
    },
    micButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        elevation: 10,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    micIcon: {
        fontSize: 50,
    },
    manualButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        backgroundColor: '#1c1c1e',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#3a3a3c',
    },
    manualText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    statsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    statsIcon: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: '600',
    },
});
