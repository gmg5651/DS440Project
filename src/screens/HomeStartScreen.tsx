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
        router.push('/recording');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.settingsHeaderBtn}
                onPress={() => router.push('/settings')}
            >
                <View style={styles.settingsBadge}>
                    <Text style={styles.settingsIcon}>⚙️</Text>
                    <Text style={styles.settingsText}>Ratios</Text>
                </View>
            </TouchableOpacity>

            <Text style={styles.title}>Swiftulin</Text>
            <Text style={styles.subtitle}>Your Private Insulin Dosing Assistant</Text>

            <TouchableOpacity
                style={styles.micButton}
                testID="btn-start-recording"
                onPress={handleStart}>
                <Text style={styles.micIcon}>🎙️</Text>
            </TouchableOpacity>

            <Text style={styles.micLabel}>Tap to speak your meal</Text>

            <TouchableOpacity
                style={styles.manualButton}
                onPress={() => router.push('/manual-carb')}>
                <Text style={styles.manualText}>⌨️ Manual Entry</Text>
            </TouchableOpacity>

            <View style={styles.examplesContainer}>
                <Text style={styles.examplesTitle}>Try saying things like:</Text>
                <Text style={styles.exampleText}>• "I had two slices of pizza and a salad"</Text>
                <Text style={styles.exampleText}>• "One large apple and a cup of milk"</Text>
                <Text style={styles.exampleText}>• "1.5 oranges and 10 oz of juice"</Text>
            </View>
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
    settingsHeaderBtn: {
        position: 'absolute',
        top: 60,
        right: 20,
    },
    settingsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1c1c1e',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#3a3a3c',
    },
    settingsIcon: {
        fontSize: 18,
    },
    settingsText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
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
    micLabel: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 60,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    manualButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        backgroundColor: '#1c1c1e',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#3a3a3c',
    },
    manualText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    examplesContainer: {
        width: '100%',
        backgroundColor: '#1c1c1e',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2c2c2e',
    },
    examplesTitle: {
        color: '#aaa',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    exampleText: {
        color: '#666',
        fontSize: 15,
        marginBottom: 8,
        fontStyle: 'italic',
    },
});
