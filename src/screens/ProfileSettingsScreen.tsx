import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProfileSettingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <Text style={styles.label}>ICR (g/Unit)</Text>
            <TextInput
                style={styles.input}
                testID="input-icr"
                keyboardType="numeric"
                defaultValue="10"
            />

            <Text style={styles.label}>ISF (mg/dL/Unit)</Text>
            <TextInput
                style={styles.input}
                testID="input-isf"
                keyboardType="numeric"
                defaultValue="50"
            />

            <Text style={styles.label}>Target Glucose (mg/dL)</Text>
            <TextInput
                style={styles.input}
                testID="input-target-glucose"
                keyboardType="numeric"
                defaultValue="100"
            />

            <TouchableOpacity
                style={styles.saveButton}
                testID="btn-save-settings"
                onPress={() => { }}
            >
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1E1E1E', padding: 24, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 32, textAlign: 'center' },
    label: { fontSize: 16, color: '#aaa', marginBottom: 8 },
    input: {
        backgroundColor: '#121212', color: '#fff', fontSize: 18,
        borderRadius: 8, padding: 16, marginBottom: 24,
        borderWidth: 1, borderColor: '#333'
    },
    saveButton: {
        backgroundColor: '#007AFF', padding: 18, borderRadius: 12,
        alignItems: 'center', marginTop: 16
    },
    saveText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
