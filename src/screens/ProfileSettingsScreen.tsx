import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { router } from 'expo-router';

export default function ProfileSettingsScreen() {
    const store = useSettingsStore();
    const [icr, setIcr] = useState(store.icr.toString());
    const [isf, setIsf] = useState(store.isf.toString());
    const [target, setTarget] = useState(store.targetGlucose.toString());
    const [threshold, setThreshold] = useState(store.isfThreshold.toString());
    const [maxDose, setMaxDose] = useState(store.maxDose.toString());
    const [rounding, setRounding] = useState(store.roundingMode);

    const handleSave = async () => {
        store.setIcr(parseFloat(icr) || 10);
        store.setIsf(parseFloat(isf) || 50);
        store.setTargetGlucose(parseFloat(target) || 100);
        store.setIsfThreshold(parseFloat(threshold) || 150);
        store.setMaxDose(parseFloat(maxDose) || 15);
        store.setRoundingMode(rounding);
        await store.saveToSecureStore();
        router.back();
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Personal Ratios</Text>

            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Why set these?</Text>
                <Text style={styles.infoText}>
                    Your insulin-to-carb ratio (ICR) and sensitivity factor (ISF) are unique to you.
                    Swiftulin uses these values to calculate your recommended dose.
                    {"\n\n"}
                    <Text style={{ fontWeight: 'bold' }}>Consult your doctor</Text> to get your specific ratios before using this app for dosing.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Settings</Text>

                <Text style={styles.label}>ICR (g/Unit)</Text>
                <TextInput
                    style={styles.input}
                    testID="input-icr"
                    keyboardType="numeric"
                    value={icr}
                    onChangeText={setIcr}
                    placeholder="e.g. 10"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>ISF (mg/dL/Unit)</Text>
                <TextInput
                    style={styles.input}
                    testID="input-isf"
                    keyboardType="numeric"
                    value={isf}
                    onChangeText={setIsf}
                    placeholder="e.g. 50"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Target Glucose (mg/dL)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={target}
                    onChangeText={setTarget}
                    placeholder="100"
                    placeholderTextColor="#666"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Advanced & Safety</Text>

                <Text style={styles.label}>Correction Threshold (mg/dL)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={threshold}
                    onChangeText={setThreshold}
                    placeholder="150"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Max Insulin Dose (Units)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={maxDose}
                    onChangeText={setMaxDose}
                    placeholder="15"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Rounding Mode</Text>
                <View style={styles.roundingContainer}>
                    {(['none', 'half', 'whole'] as const).map((mode) => (
                        <TouchableOpacity
                            key={mode}
                            style={[styles.roundingBtn, rounding === mode && styles.roundingBtnActive]}
                            onPress={() => setRounding(mode)}
                        >
                            <Text style={[styles.roundingBtnText, rounding === mode && styles.roundingBtnTextActive]}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                testID="btn-save-settings"
                onPress={handleSave}
            >
                <Text style={styles.saveText}>Save Configuration</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0a' },
    content: { padding: 24, paddingBottom: 60 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 32, marginTop: 40 },
    section: { marginBottom: 32, backgroundColor: '#1c1c1e', padding: 20, borderRadius: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 20 },
    label: { fontSize: 14, color: '#aaa', marginBottom: 8 },
    input: {
        backgroundColor: '#2c2c2e', color: '#fff', fontSize: 18,
        borderRadius: 12, padding: 16, marginBottom: 20,
        borderWidth: 1, borderColor: '#3a3a3c'
    },
    roundingContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    roundingBtn: {
        flex: 1, padding: 12, alignItems: 'center', borderRadius: 10,
        backgroundColor: '#2c2c2e', marginHorizontal: 4,
        borderWidth: 1, borderColor: '#3a3a3c'
    },
    roundingBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    roundingBtnText: { color: '#aaa', fontWeight: '600' },
    roundingBtnTextActive: { color: '#fff' },
    saveButton: {
        backgroundColor: '#007AFF', padding: 18, borderRadius: 16,
        alignItems: 'center', marginTop: 10,
        shadowColor: '#007AFF', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
    },
    saveText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    infoBox: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        padding: 20,
        borderRadius: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#007AFF'
    },
    infoTitle: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8
    },
    infoText: {
        color: '#aaa',
        fontSize: 14,
        lineHeight: 20
    }
});
