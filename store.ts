import { create } from 'zustand';

interface TreeState {
  mode: 'SCATTERED' | 'TREE_SHAPE';
  toggleMode: () => void;
  setMode: (mode: 'SCATTERED' | 'TREE_SHAPE') => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  mode: 'TREE_SHAPE', // Start formed for initial impact
  toggleMode: () => set((state) => ({ 
    mode: state.mode === 'SCATTERED' ? 'TREE_SHAPE' : 'SCATTERED' 
  })),
  setMode: (mode) => set({ mode }),
}));