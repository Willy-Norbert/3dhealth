import { create } from 'zustand';

interface VRState {
  cprScore: number;
  cprTimeLeft: number;
  incrementCprScore: () => void;
  decrementCprTime: () => void;
  resetCpr: () => void;
  
  selectedTool: string | null;
  setSelectedTool: (tool: string | null) => void;
}

export const useVRStore = create<VRState>((set) => ({
  cprScore: 0,
  cprTimeLeft: 30, // 30 seconds for CPR session
  incrementCprScore: () => set((state) => ({ cprScore: state.cprScore + 1 })),
  decrementCprTime: () => set((state) => ({ cprTimeLeft: Math.max(0, state.cprTimeLeft - 1) })),
  resetCpr: () => set({ cprScore: 0, cprTimeLeft: 30 }),
  
  selectedTool: null,
  setSelectedTool: (tool) => set({ selectedTool: tool }),
}));
