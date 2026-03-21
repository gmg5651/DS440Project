import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useFlowStore } from '@/store/flowStore';
import { extractMealData } from '@/utils/nlpExtractor';
import { router } from 'expo-router';

export default function HomeResultsScreen() {
    const { transcript, extraction, setExtraction } = useFlowStore();

    useEffect(() => {
        if (transcript && !extraction) {
            const result = extractMealData(transcript);
            setExtraction(result);
        }
    }, [transcript, extraction]);

    const items = extraction?.items || [];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verification</Text>

            {transcript ? (
                <View style={styles.transcriptDebug}>
                    <Text style={styles.debugText}>"{transcript}"</Text>
                </View>
            ) : null}

            <FlatList
                data={items}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.carbs}>{item.carbsG}g Carbs</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No food items detected. Try manual entry?</Text>
                }
            />

            {extraction?.glucose && (
                <View style={styles.glucoseCard}>
                    <Text style={styles.glucoseLabel}>Glucose</Text>
                    <Text style={styles.glucoseValue}>{extraction.glucose} mg/dL</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.calcButton}
                testID="btn-calculate-dose"
                onPress={() => router.push('/dose-modal')}
            >
                <Text style={styles.calcText}>Calculate Dose</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, marginTop: 40 },
    transcriptDebug: { backgroundColor: '#1E1E1E', padding: 12, borderRadius: 8, marginBottom: 20 },
    debugText: { color: '#aaa', fontStyle: 'italic' },
    card: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
    foodName: { fontSize: 18, color: '#fff', textTransform: 'capitalize' },
    carbs: { fontSize: 18, color: '#007AFF', fontWeight: 'bold' },
    glucoseCard: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', borderLeftWidth: 4, borderLeftColor: '#34C759' },
    glucoseLabel: { fontSize: 18, color: '#fff' },
    glucoseValue: { fontSize: 18, color: '#34C759', fontWeight: 'bold' },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 16 },
    calcButton: {
        backgroundColor: '#007AFF', padding: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 20, marginBottom: 40
    },
    calcText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
