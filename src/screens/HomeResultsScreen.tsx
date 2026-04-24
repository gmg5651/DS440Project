import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFlowStore, FinalFoodItem } from '@/store/flowStore';
import { useSettingsStore } from '@/store/settingsStore';
import { segmentMeal } from '@/utils/nlpExtractor';
import { useQuery } from '@tanstack/react-query';
import { searchUSDAFood, getCarbsForQuantity } from '@/services/usdaService';
import { router } from 'expo-router';

export default function HomeResultsScreen() {
    const settings = useSettingsStore();
    const {
        transcript, segments, setSegments,
        finalItems, setFinalItems, updateItemQuantity,
        glucose, setGlucose,
        icr, setIcr
    } = useFlowStore();

    // Determine values to show (session override or global setting)
    const displayGlucose = glucose !== null ? glucose : settings.targetGlucose;
    const displayIcr = icr !== null ? icr : settings.icr;

    const lastSegmented = React.useRef<string | null>(null);

    // Legacy segmenter still runs to update glucose if found in text
    useEffect(() => {
        if (transcript && transcript !== lastSegmented.current && segments.length === 0) {
            lastSegmented.current = transcript;
            const result = segmentMeal(transcript);
            setSegments(result.segments);
            setGlucose(result.glucose);
        }
    }, [transcript, segments]);

    // Query to handle USDA lookup for each segment
    const { isFetching, error, refetch } = useQuery({
        queryKey: ['usda-search', segments],
        queryFn: async () => {
            if (segments.length === 0) return [];

            const results = await Promise.all(segments.map(async (seg) => {
                try {
                    // searchAndGetNutrition follows strict scoring architecture:
                    // 1. Foundation/SR Legacy datatypes
                    // 2. Similarity ranking
                    // 3. Carbohydrate, by difference
                    const match = await searchUSDAFood(seg.name);

                    if (match) {
                        // If a volume unit was stated (e.g. "2 cups"), use exact gram weight
                        const carbs = seg.gramsOverride != null
                            ? (match.carbs100g * seg.gramsOverride) / 100
                            : getCarbsForQuantity(match, seg.quantity);
                        return {
                            name: match.name,
                            carbsG: carbs,
                            quantity: seg.quantity,
                            baseCarbsG: match.carbs100g,
                            gramsPerUnit: seg.gramsOverride != null
                                ? seg.gramsOverride / seg.quantity
                                : match.gramsPerUnit,
                            unitName: seg.unit || match.unitName,
                        };
                    }
                } catch (err) {
                    console.error(`Error searching ${seg.name}:`, err);
                }

                // Drop garbage input entirely if USDA finds zero matches
                return null;
            }));

            const validItems = results.filter(Boolean) as FinalFoodItem[];
            setFinalItems(validItems);
            return validItems;
        },
        enabled: segments.length > 0 && finalItems.length === 0,
        retry: false
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                style={styles.keyboardAvoid}
            >
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Verification</Text>

            {transcript ? (
                <View style={styles.transcriptDebug}>
                    <Text style={styles.debugText}>"{transcript}"</Text>
                    {error && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>Error: {(error as Error).message}</Text>
                            <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ) : null}

            {isFetching ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Fetching nutritional data...</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={finalItems}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View style={styles.card}>
                                <View style={styles.info}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.foodName}>{item.name}</Text>
                                        <View style={[styles.sourceBadge, { backgroundColor: item.baseCarbsG !== 15 ? '#34C759' : '#444' }]}>
                                            <Text style={styles.sourceText}>
                                                {item.baseCarbsG !== 15 ? 'USDA' : 'Estimate'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.gramsText}>
                                        {Math.round(item.gramsPerUnit)}g · {item.unitName || '1 portion'}
                                    </Text>
                                    <Text style={styles.carbs}>{Math.round(item.carbsG)}g Carbs</Text>
                                </View>

                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity
                                        onPress={() => updateItemQuantity(index, Math.max(0, Math.round((item.quantity - 0.1) * 10) / 10))}
                                        style={styles.qtyBtn}
                                    >
                                        <Text style={styles.qtyBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>
                                        {Math.round(item.quantity * 10) / 10}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => updateItemQuantity(index, Math.round((item.quantity + 0.1) * 10) / 10)}
                                        style={styles.qtyBtn}
                                    >
                                        <Text style={styles.qtyBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No food items detected. Try manual entry?</Text>
                        }
                        style={styles.list}
                    />

                    <View style={styles.overrideSection}>
                        <View style={styles.overrideItem}>
                            <Text style={styles.overrideLabel}>Glucose (mg/dL)</Text>
                            <TextInput
                                style={styles.overrideInput}
                                keyboardType="numeric"
                                placeholder={settings.targetGlucose.toString()}
                                value={glucose !== null ? glucose.toString() : settings.targetGlucose.toString()}
                                onChangeText={(val) => setGlucose(val === '' ? null : parseFloat(val))}
                                placeholderTextColor="#444"
                            />
                        </View>
                        <View style={styles.overrideItem}>
                            <Text style={styles.overrideLabel}>ICR (g/Unit)</Text>
                            <TextInput
                                style={styles.overrideInput}
                                keyboardType="numeric"
                                placeholder={settings.icr.toString()}
                                value={icr !== null ? icr.toString() : settings.icr.toString()}
                                onChangeText={(val) => setIcr(val === '' ? null : parseFloat(val))}
                                placeholderTextColor="#444"
                            />
                        </View>
                    </View>
                </>
            )}

            <TouchableOpacity
                style={[styles.calcButton, isFetching && styles.disabledButton]}
                testID="btn-calculate-dose"
                onPress={() => !isFetching && router.push('/dose-modal')}
                disabled={isFetching}
            >
                <Text style={styles.calcText}>Calculate Dose</Text>
            </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0a0a0a' },
    keyboardAvoid: { flex: 1 },
    innerContainer: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, marginTop: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#aaa', marginTop: 10 },
    transcriptDebug: { backgroundColor: '#1c1c1e', padding: 12, borderRadius: 8, marginBottom: 20 },
    debugText: { color: '#aaa', fontStyle: 'italic' },
    card: {
        backgroundColor: '#1c1c1e', padding: 16, borderRadius: 16, marginBottom: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: '#2c2c2e'
    },
    info: { flex: 1 },
    foodName: { fontSize: 16, color: '#fff', textTransform: 'capitalize', fontWeight: '600', flexShrink: 1 },
    gramsText: { fontSize: 12, color: '#8e8e93', marginTop: 2, marginBottom: 2 },
    carbs: { fontSize: 14, color: '#007AFF', fontWeight: 'bold', marginTop: 2 },
    nameRow: { flexDirection: 'row', alignItems: 'center' },
    sourceBadge: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    sourceText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2e', borderRadius: 12, padding: 4 },
    qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#3a3a3c' },
    qtyBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    qtyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginHorizontal: 12, minWidth: 20, textAlign: 'center' },
    glucoseCard: { backgroundColor: '#1c1c1e', padding: 16, borderRadius: 16, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', borderLeftWidth: 4, borderLeftColor: '#34C759' },
    glucoseLabel: { fontSize: 18, color: '#fff' },
    glucoseValue: { fontSize: 18, color: '#34C759', fontWeight: 'bold' },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 16 },
    list: { flex: 1 },
    overrideSection: {
        flexDirection: 'row', justifyContent: 'space-between',
        backgroundColor: '#1c1c1e', padding: 16, borderRadius: 16,
        marginTop: 12, marginBottom: 12, borderWidth: 1, borderColor: '#2c2c2e'
    },
    overrideItem: { flex: 1, alignItems: 'center' },
    overrideLabel: { fontSize: 12, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
    overrideInput: {
        fontSize: 22, color: '#007AFF', fontWeight: 'bold',
        textAlign: 'center', minWidth: 60, padding: 4
    },
    calcButton: {
        backgroundColor: '#007AFF', padding: 18, borderRadius: 16,
        alignItems: 'center', marginTop: 10, marginBottom: 30,
        shadowColor: '#007AFF', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
    },
    disabledButton: { backgroundColor: '#333' },
    calcText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    errorBanner: { marginTop: 10, padding: 10, backgroundColor: '#442222', borderRadius: 8, borderWidth: 1, borderColor: '#ff4444' },
    errorText: { color: '#ff4444', fontSize: 12, fontWeight: '600' },
    retryBtn: { marginTop: 8, padding: 8, backgroundColor: '#ff4444', borderRadius: 6, alignSelf: 'flex-start' },
    retryText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});
