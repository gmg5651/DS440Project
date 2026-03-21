import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { db } from '@/db';
import { glucoseLogs, mealLogs, doseLogs } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';

export default function StatsScreen() {
    const [stats, setStats] = useState({ avgGlucose: 0, totalInsulin: 0, totalCarbs: 0 });

    useEffect(() => {
        async function loadStats() {
            // Basic aggregate queries
            const glucoseResult = await db.select({ avg: sql<number>`avg(${glucoseLogs.glucoseMgDl})` }).from(glucoseLogs);
            const doseResult = await db.select({ sum: sql<number>`sum(${doseLogs.totalUnits})` }).from(doseLogs);
            const carbResult = await db.select({ sum: sql<number>`sum(${mealLogs.carbsG})` }).from(mealLogs);

            setStats({
                avgGlucose: Math.round(glucoseResult[0]?.avg || 0),
                totalInsulin: parseFloat((doseResult[0]?.sum || 0).toFixed(1)),
                totalCarbs: Math.round(carbResult[0]?.sum || 0),
            });
        }
        loadStats();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>7-Day Overview</Text>

            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Avg Glucose</Text>
                <Text style={styles.statValue}>{stats.avgGlucose || '--'} mg/dL</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Insulin</Text>
                <Text style={styles.statValue}>{stats.totalInsulin || '0'} U</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Carbs</Text>
                <Text style={styles.statValue}>{stats.totalCarbs || '0'} g</Text>
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
