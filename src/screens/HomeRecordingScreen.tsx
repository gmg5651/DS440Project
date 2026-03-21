import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeRecordingScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Listening...</Text>
            <View style={styles.pulseIndicator} />

            <TouchableOpacity
                style={styles.stopButton}
                testID="btn-stop-recording"
                onPress={() => { }}
            >
                <Text style={styles.stopText}>⏹</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 48 },
    stopButton: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF3B30',
        justifyContent: 'center', alignItems: 'center', shadowColor: '#FF3B30',
        shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
    },
    stopText: { fontSize: 32 },
    pulseIndicator: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,122,255,0.2)', marginBottom: 48 },
});
