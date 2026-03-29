import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface SettingsState {
    icr: number;
    isf: number;
    targetGlucose: number;
    isfThreshold: number;
    maxDose: number;
    roundingMode: 'none' | 'half' | 'whole';
    setIcr: (v: number) => void;
    setIsf: (v: number) => void;
    setTargetGlucose: (v: number) => void;
    setIsfThreshold: (v: number) => void;
    setMaxDose: (v: number) => void;
    setRoundingMode: (v: 'none' | 'half' | 'whole') => void;
    loadFromSecureStore: () => Promise<void>;
    saveToSecureStore: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    icr: 10,
    isf: 50,
    targetGlucose: 100,
    isfThreshold: 150,
    maxDose: 15,
    roundingMode: 'half',
    setIcr: (v) => set({ icr: v }),
    setIsf: (v) => set({ isf: v }),
    setTargetGlucose: (v) => set({ targetGlucose: v }),
    setIsfThreshold: (v) => set({ isfThreshold: v }),
    setMaxDose: (v) => set({ maxDose: v }),
    setRoundingMode: (v) => set({ roundingMode: v }),
    loadFromSecureStore: async () => {
        const raw = await SecureStore.getItemAsync('settings');
        if (raw) set(JSON.parse(raw));
    },
    saveToSecureStore: async () => {
        const { icr, isf, targetGlucose, isfThreshold, maxDose, roundingMode } = get();
        await SecureStore.setItemAsync('settings', JSON.stringify({ icr, isf, targetGlucose, isfThreshold, maxDose, roundingMode }));
    },
}));
