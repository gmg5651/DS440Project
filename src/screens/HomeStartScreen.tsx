import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeStartScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Swiftulin</Text>
            <Text style={styles.subtitle}>Tap to log a meal or dose</Text>

            <TouchableOpacity
                style={styles.micButton}
                testID="btn-start-recording"
                onPress={() => { }}
            >
                <Text style={styles.micText}>🎤</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#aaa', marginBottom: 48 },
    micButton: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#007AFF',
        justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF',
        shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
    },
    micText: { fontSize: 48 },
});
