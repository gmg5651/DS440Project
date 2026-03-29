import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useFlowStore } from '@/store/flowStore';

export default function ManualCarbModal() {
    const [carbs, setCarbs] = useState('');
    const [glucoseInput, setGlucoseInput] = useState('');
    const { setFinalItems, setGlucose } = useFlowStore();

    const handleSave = () => {
        const carbNum = parseInt(carbs, 10);
        const glucoseNum = parseInt(glucoseInput, 10);

        if (isNaN(carbNum)) return;

        // Directly set final items and glucose for manual entry
        setFinalItems([{
            name: 'Manual Entry',
            carbsG: carbNum,
            quantity: 1,
            baseCarbsG: carbNum
        }]);
        setGlucose(isNaN(glucoseNum) ? null : glucoseNum);

        router.push('/results');
    };

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
                value={carbs}
                onChangeText={setCarbs}
            />

            <Text style={styles.label}>Current Glucose (mg/dL) - Optional</Text>
            <TextInput
                style={styles.input}
                testID="input-manual-glucose"
                keyboardType="numeric"
                placeholder="e.g. 150"
                placeholderTextColor="#666"
                value={glucoseInput}
                onChangeText={setGlucoseInput}
            />

            <TouchableOpacity
                style={styles.saveButton}
                testID="btn-save-carb"
                onPress={handleSave}
            >
                <Text style={styles.saveText}>Continue to Dose Calc</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
            >
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        padding: 24,
        justifyContent: 'center'
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 40,
        textAlign: 'center'
    },
    label: {
        fontSize: 16,
        color: '#aaa',
        marginBottom: 8
    },
    input: {
        backgroundColor: '#1c1c1e',
        color: '#fff',
        fontSize: 24,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#3a3a3c'
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    cancelButton: {
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelText: {
        color: '#888',
        fontSize: 16,
    }
});
