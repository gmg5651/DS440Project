import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function ManualCarbModal() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manual Entry</Text>

            <Text style={styles.label}>Total Carbs (g)</Text>
            <TextInput
                style={styles.input}
                testID="input-manual-carb"
                keyboardType="numeric"
                placeholder="e.g. 45"
                placeholderTextColor="#666"
            />

            <TouchableOpacity
                style={styles.saveButton}
                testID="btn-save-carb"
                onPress={() => { }}
            >
                <Text style={styles.saveText}>Save Entry</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1E1E1E', padding: 24, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 32, textAlign: 'center' },
    label: { fontSize: 16, color: '#aaa', marginBottom: 8 },
    input: {
        backgroundColor: '#121212', color: '#fff', fontSize: 24,
        borderRadius: 8, padding: 16, marginBottom: 32,
        borderWidth: 1, borderColor: '#333'
    },
    saveButton: {
        backgroundColor: '#007AFF', padding: 18, borderRadius: 12,
        alignItems: 'center'
    },
    saveText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
