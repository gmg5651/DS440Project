import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>7-Day Overview</Text>

            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Avg Glucose</Text>
                <Text style={styles.statValue}>115 mg/dL</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Insulin</Text>
                <Text style={styles.statValue}>42.5 U</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Carbs</Text>
                <Text style={styles.statValue}>320 g</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1E1E1E', padding: 24, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 32, textAlign: 'center' },
    statCard: { backgroundColor: '#121212', padding: 20, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
    statLabel: { fontSize: 16, color: '#aaa', marginBottom: 8 },
    statValue: { fontSize: 28, color: '#007AFF', fontWeight: 'bold' }
});
