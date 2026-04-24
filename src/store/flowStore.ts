import { create } from 'zustand';
import { ExtractionResult, FoodSegment } from '@/utils/nlpExtractor';

export interface FinalFoodItem {
    name: string;
    carbsG: number;
    quantity: number;
    baseCarbsG: number;   // carbs per 100g (USDA)
    gramsPerUnit: number; // gram weight for 1 portion (e.g. 110g for 1 banana)
    unitName: string;     // human label (e.g. "Banana", "1 medium", "tsp")
}

interface FlowState {
    transcript: string;
    segments: FoodSegment[];
    finalItems: FinalFoodItem[];
    glucose: number | null;
    icr: number | null;
    isLoading: boolean;
    setTranscript: (t: string) => void;
    setSegments: (s: FoodSegment[]) => void;
    setFinalItems: (items: FinalFoodItem[]) => void;
    updateItemQuantity: (index: number, newQty: number) => void;
    setGlucose: (g: number | null) => void;
    setIcr: (icr: number | null) => void;
    setIsLoading: (loading: boolean) => void;
    resetFlow: () => void;
}

export const useFlowStore = create<FlowState>((set) => ({
    transcript: '',
    segments: [],
    finalItems: [],
    glucose: null,
    icr: null,
    isLoading: false,
    setTranscript: (t) => set({ transcript: t }),
    setSegments: (s) => set({ segments: s }),
    setFinalItems: (items) => set({ finalItems: items }),
    updateItemQuantity: (index, newQty) => set((state) => {
        const newItems = [...state.finalItems];
        if (newItems[index]) {
            const item = newItems[index];
            // Recompute: carbs_per_100g * grams_per_unit * qty / 100
            const newCarbs = (item.baseCarbsG * item.gramsPerUnit * newQty) / 100;
            newItems[index] = { ...item, quantity: newQty, carbsG: newCarbs };
        }
        return { finalItems: newItems };
    }),
    setGlucose: (g) => set({ glucose: g }),
    setIcr: (icr) => set({ icr }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    resetFlow: () => set({
        transcript: '', segments: [], finalItems: [], glucose: null, icr: null,
        isLoading: false
    }),
}));
