import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useFlowStore } from '@/store/flowStore';
import { useSettingsStore } from '@/store/settingsStore';
import { calculateDose } from '@/utils/insulinCalculator';
import { db } from '@/db';
import { mealLogs, glucoseLogs, doseLogs } from '@/db/schema';

export default function DoseModal() {
    const { extraction, resetFlow } = useFlowStore();
    const settings = useSettingsStore();

    const dose = useMemo(() => {
        if (!extraction) return null;
        const totalCarbsG = extraction.items.reduce((sum, i) => sum + i.carbsG, 0);
        const glucoseMgDl = extraction.glucose || settings.targetGlucose;

        return calculateDose({
            totalCarbsG,
            glucoseMgDl,
            icr: settings.icr,
            isf: settings.isf,
            targetGlucose: settings.targetGlucose,
        });
    }, [extraction, settings]);

    const handleConfirm = async () => {
        if (!dose || !extraction) return;

        try {
            const now = Date.now();

            // 1. Save meal items
            for (const item of extraction.items) {
                await db.insert(mealLogs).values({
                    foodName: item.name,
                    carbsG: item.carbsG,
                    createdAt: now,
                });
            }

            // 2. Save glucose if present
            if (extraction.glucose) {
                await db.insert(glucoseLogs).values({
                    glucoseMgDl: extraction.glucose,
                    createdAt: now,
                });
            }

            // 3. Save dose
            await db.insert(doseLogs).values({
                mealDoseUnits: dose.mealDose,
                correctionDoseUnits: dose.correctionDose,
                totalUnits: dose.totalDose,
                confirmed: true,
                createdAt: now,
            });

            resetFlow();
            router.replace('/');
            // Alert.alert('Success', 'Dose logged successfully');
        } catch (error) {
            console.error('Failed to log dose:', error);
            Alert.alert('Error', 'Failed to save dose to database');
        }
    };

    if (!dose) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dose Breakdown</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Meal Dose</Text>
                <Text style={styles.value}>{dose.mealDose.toFixed(1)} U</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Correction Dose</Text>
                <Text style={styles.value}>{dose.correctionDose.toFixed(1)} U</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
                <Text style={styles.labelTotal}>Total</Text>
                <Text style={styles.valueTotal}>{dose.totalDose.toFixed(1)} U</Text>
            </View>

            <TouchableOpacity
                style={styles.confirmButton}
                testID="btn-confirm-dose"
                onPress={handleConfirm}
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
