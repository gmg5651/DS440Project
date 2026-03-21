import { create } from 'zustand';
import { ExtractionResult, FoodItem } from '@/utils/nlpExtractor';

interface FlowState {
    transcript: string;
    extraction: ExtractionResult | null;
    setTranscript: (t: string) => void;
    setExtraction: (e: ExtractionResult) => void;
    resetFlow: () => void;
}

export const useFlowStore = create<FlowState>((set) => ({
    transcript: '',
    extraction: null,
    setTranscript: (t) => set({ transcript: t }),
    setExtraction: (e) => set({ extraction: e }),
    resetFlow: () => set({ transcript: '', extraction: null }),
}));
