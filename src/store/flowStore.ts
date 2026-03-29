import { create } from 'zustand';
import { ExtractionResult, FoodSegment } from '@/utils/nlpExtractor';

export interface FinalFoodItem {
    name: string;
    carbsG: number;
    quantity: number;
    baseCarbsG: number; // Carbs for 1 unit
}

interface FlowState {
    transcript: string;
    segments: FoodSegment[];
    finalItems: FinalFoodItem[];
    glucose: number | null;
    icr: number | null; // Session-specific ICR override
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
            newItems[index] = {
                ...newItems[index],
                quantity: newQty,
                carbsG: newItems[index].baseCarbsG * newQty
            };
        }
        return { finalItems: newItems };
    }),
    setGlucose: (g) => set({ glucose: g }),
    setIcr: (icr) => set({ icr }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    resetFlow: () => set({ transcript: '', segments: [], finalItems: [], glucose: null, icr: null, isLoading: false }),
}));
