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
                onPress={handleStart}
            >
                <Text style={styles.micText}>🎤</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <TouchableOpacity onPress={() => router.push('/settings')}>
                    <Text style={styles.footerLink}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/stats')}>
                    <Text style={styles.footerLink}>Stats</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#aaa', marginBottom: 48 },
    micButton: {
        width: 120, height: 120, borderRadius: 60, backgroundColor: '#007AFF',
        justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF',
        shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
    },
    micText: { fontSize: 54 },
    footer: { position: 'absolute', bottom: 60, flexDirection: 'row', gap: 40 },
    footerLink: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' }
});
