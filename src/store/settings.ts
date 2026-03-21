import { create } from 'zustand';

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
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('swiftulin_settings');
            if (raw) set(JSON.parse(raw));
        }
    },
    saveToSecureStore: async () => {
        if (typeof window !== 'undefined') {
            const { icr, isf, targetGlucose } = get();
            localStorage.setItem('swiftulin_settings', JSON.stringify({ icr, isf, targetGlucose }));
        }
    },
}));
