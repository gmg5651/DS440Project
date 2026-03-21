import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

export default function HomeResultsScreen() {
    const dummyData = [{ id: '1', name: 'Pizza', carbsG: 52 }];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verification</Text>

            <FlatList
                data={dummyData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.carbs}>{item.carbsG}g Carbs</Text>
                    </View>
                )}
            />

            <TouchableOpacity
                style={styles.calcButton}
                testID="btn-calculate-dose"
                onPress={() => { }}
            >
                <Text style={styles.calcText}>Calculate Dose</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, marginTop: 40 },
    card: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
    foodName: { fontSize: 18, color: '#fff' },
    carbs: { fontSize: 18, color: '#007AFF', fontWeight: 'bold' },
    calcButton: {
        backgroundColor: '#007AFF', padding: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 20, marginBottom: 40
    },
    calcText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
