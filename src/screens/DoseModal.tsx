import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DoseModal() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dose Breakdown</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Meal Dose</Text>
                <Text style={styles.value}>7.5 U</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Correction Dose</Text>
                <Text style={styles.value}>1.2 U</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
                <Text style={styles.labelTotal}>Total</Text>
                <Text style={styles.valueTotal}>8.7 U</Text>
            </View>

            <TouchableOpacity
                style={styles.confirmButton}
                testID="btn-confirm-dose"
                onPress={() => { }}
            >
                <Text style={styles.confirmText}>Confirm Dose</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1E1E1E', padding: 24, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 32, textAlign: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    label: { fontSize: 18, color: '#aaa' },
    value: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
    totalRow: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#333' },
    labelTotal: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
    valueTotal: { fontSize: 22, color: '#007AFF', fontWeight: 'bold' },
    confirmButton: {
        backgroundColor: '#34C759', padding: 18, borderRadius: 12,
        alignItems: 'center', marginTop: 48
    },
    confirmText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
