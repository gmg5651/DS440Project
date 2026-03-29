import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useFlowStore, FinalFoodItem } from '@/store/flowStore';
import { useSettingsStore } from '@/store/settingsStore';
import { segmentMeal } from '@/utils/nlpExtractor';
import { searchFood, getFoodDetails, parseNaturalLanguage } from '@/services/fatSecretService';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

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

    useEffect(() => {
        if (transcript && segments.length === 0) {
            const result = segmentMeal(transcript);
            setSegments(result.segments);
            setGlucose(result.glucose);
        }
    }, [transcript, segments]);

    // Query to fetch data from FatSecret
    const { isFetching } = useQuery({
        queryKey: ['fatsecret', transcript, segments],
        queryFn: async () => {
            if (!transcript) return [];

            try {
                // 1. Try high-accuracy Natural Language Processing first
                const nlpResults = await parseNaturalLanguage(transcript);
                if (nlpResults.length > 0) {
                    setFinalItems(nlpResults);
                    return nlpResults;
                }
            } catch (err) {
                console.warn('FatSecret NLP failed, falling back to manual segments:', err);
            }

            // 2. Fallback to manual segmentation if NLP fails or returns nothing
            if (segments.length === 0) return [];

            const results: FinalFoodItem[] = [];
            for (const segment of segments) {
                try {
                    const searchResults = await searchFood(segment.name);
                    if (searchResults.length > 0) {
                        const bestMatch = searchResults[0];
                        const details = await getFoodDetails(bestMatch.food_id);
                        if (details) {
                            results.push({
                                name: bestMatch.food_name,
                                quantity: segment.quantity,
                                baseCarbsG: details.carbohydrate,
                                carbsG: details.carbohydrate * segment.quantity
                            });
                        }
                    } else {
                        results.push({
                            name: segment.name,
                            quantity: segment.quantity,
                            baseCarbsG: 15,
                            carbsG: 15 * segment.quantity
                        });
                    }
                } catch (err) {
                    console.error('FatSecret Fallback Error for', segment.name, err);
                    results.push({
                        name: segment.name,
                        quantity: segment.quantity,
                        baseCarbsG: 10,
                        carbsG: 10 * segment.quantity
                    });
                }
            }
            setFinalItems(results);
            return results;
        },
        enabled: !!transcript && finalItems.length === 0,
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verification</Text>

            {transcript ? (
                <View style={styles.transcriptDebug}>
                    <Text style={styles.debugText}>"{transcript}"</Text>
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
                                    <Text style={styles.foodName}>{item.name}</Text>
                                    <Text style={styles.carbs}>{Math.round(item.carbsG)}g Carbs</Text>
                                </View>

                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity
                                        onPress={() => updateItemQuantity(index, Math.max(0.5, item.quantity - 0.5))}
                                        style={styles.qtyBtn}
                                    >
                                        <Text style={styles.qtyBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        onPress={() => updateItemQuantity(index, item.quantity + 0.5)}
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20 },
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
    foodName: { fontSize: 18, color: '#fff', textTransform: 'capitalize', fontWeight: '600' },
    carbs: { fontSize: 14, color: '#007AFF', fontWeight: 'bold', marginTop: 4 },
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
    calcText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
