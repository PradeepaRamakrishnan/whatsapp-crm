import { create } from 'zustand';

interface FileFilterState {
  filter: string;
  setFilter: (filter: string) => void;
  resetFilter: () => void;
}

export const useFileFilterStore = create<FileFilterState>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
  resetFilter: () => set({ filter: 'all' }),
}));
