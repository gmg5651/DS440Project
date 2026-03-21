import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface SettingsState {
    icr: number;
    isf: number;
    targetGlucose: number;
    setIcr: (v: number) => void;
    setIsf: (v: number) => void;
    setTargetGlucose: (v: number) => void;
    loadFromSecureStore: () => Promise<void>;
    saveToSecureStore: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    icr: 10,
    isf: 50,
    targetGlucose: 100,
    setIcr: (v) => set({ icr: v }),
    setIsf: (v) => set({ isf: v }),
    setTargetGlucose: (v) => set({ targetGlucose: v }),
    loadFromSecureStore: async () => {
        if (Platform.OS === 'web') {
            const raw = localStorage.getItem('swiftulin_settings');
            if (raw) set(JSON.parse(raw));
        } else {
            const raw = await SecureStore.getItemAsync('settings');
            if (raw) set(JSON.parse(raw));
        }
    },
    saveToSecureStore: async () => {
        const { icr, isf, targetGlucose } = get();
        if (Platform.OS === 'web') {
            localStorage.setItem('swiftulin_settings', JSON.stringify({ icr, isf, targetGlucose }));
        } else {
            await SecureStore.setItemAsync('settings', JSON.stringify({ icr, isf, targetGlucose }));
        }
    },
}));
