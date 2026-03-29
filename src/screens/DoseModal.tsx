import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useFlowStore } from '@/store/flowStore';
import { useSettingsStore } from '@/store/settingsStore';
import { calculateDose } from '@/utils/insulinCalculator';
import { db } from '@/db';
import { mealLogs, glucoseLogs, doseLogs } from '@/db/schema';

export default function DoseModal() {
    const { finalItems, glucose, icr: icrOverride, resetFlow } = useFlowStore();
    const settings = useSettingsStore();

    const dose = useMemo(() => {
        if (finalItems.length === 0) return null;
        const totalCarbsG = finalItems.reduce((sum, i) => sum + i.carbsG, 0);
        // Use provided glucose or fallback to target (no correction)
        const glucoseMgDl = glucose || settings.targetGlucose;

        return calculateDose({
            totalCarbsG,
            glucoseMgDl,
            icr: icrOverride || settings.icr,
            isf: settings.isf,
            targetGlucose: settings.targetGlucose,
            isfThreshold: settings.isfThreshold,
            maxDose: settings.maxDose,
            roundingMode: settings.roundingMode,
        });
    }, [finalItems, glucose, icrOverride, settings]);

    const handleConfirm = async () => {
        if (!dose || finalItems.length === 0) return;

        try {
            const now = Date.now();

            // 1. Save meal items
            for (const item of finalItems) {
                await db.insert(mealLogs).values({
                    foodName: item.name,
                    carbsG: item.carbsG,
                    createdAt: now,
                });
            }

            // 2. Save glucose if present (don't save if it was just fallback)
            if (glucose) {
                await db.insert(glucoseLogs).values({
                    glucoseMgDl: glucose,
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
        } catch (error) {
            console.error('Failed to log dose:', error);
            Alert.alert('Error', 'Failed to save dose to database');
        }
    };

    if (!dose) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Insulin Recommendation</Text>

            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.label}>Meal Dose</Text>
                    <Text style={styles.value}>{dose.mealDose.toFixed(2)} U</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Correction Dose</Text>
                    <Text style={styles.value}>{dose.correctionDose.toFixed(2)} U</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                    <View>
                        <Text style={styles.labelTotal}>Total Dose</Text>
                        {settings.roundingMode !== 'none' && (
                            <Text style={styles.subtext}>Rounded to nearest {settings.roundingMode}</Text>
                        )}
                    </View>
                    <Text style={styles.valueTotal}>{dose.totalDose.toFixed(settings.roundingMode === 'none' ? 2 : 1)} U</Text>
                </View>
            </View>

            {dose.isCapped && (
                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        ⚠️ Safety Cap Applied: Dose limited to your maximum of {settings.maxDose} units.
                    </Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.confirmButton}
                testID="btn-confirm-dose"
                onPress={handleConfirm}
            >
                <Text style={styles.confirmText}>Log Dose</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.push('/settings')}
            >
                <Text style={styles.cancelText}>Check Settings</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0a', padding: 24, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 32, textAlign: 'center' },
    card: { backgroundColor: '#1c1c1e', padding: 24, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#2c2c2e' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    label: { fontSize: 18, color: '#aaa' },
    value: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#2c2c2e', marginVertical: 8 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    labelTotal: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
    subtext: { fontSize: 12, color: '#666', marginTop: 2 },
    valueTotal: { fontSize: 32, color: '#007AFF', fontWeight: 'bold' },
    warningBox: { backgroundColor: 'rgba(255, 149, 0, 0.1)', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#FF9500', marginBottom: 24 },
    warningText: { color: '#FF9500', fontWeight: '600', fontSize: 14 },
    confirmButton: {
        backgroundColor: '#34C759', padding: 20, borderRadius: 16,
        alignItems: 'center', shadowColor: '#34C759', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
    },
    confirmText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    cancelButton: { padding: 16, alignItems: 'center', marginTop: 12 },
    cancelText: { color: '#666', fontSize: 16 }
});
