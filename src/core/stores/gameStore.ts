// ============================================
// NanoNovel - Game Store (Zustand)
// ============================================

import { create } from 'zustand';
import type { ScreenType } from '@/core/types';

interface GameState {
    // Current screen
    currentScreen: ScreenType;

    // Story progress
    currentStoryID: string;

    // Flags
    flags: Record<string, unknown>;

    // Inventory
    inventory: { itemID: string; count: number }[];

    // Actions
    setScreen: (screen: ScreenType) => void;
    setStoryID: (storyID: string) => void;
    setFlag: (key: string, value: unknown) => void;
    addItem: (itemID: string, count: number) => void;
    resetGame: () => void;
}

const initialState = {
    currentScreen: 'TITLE' as ScreenType,
    currentStoryID: '01_01_01',
    flags: {},
    inventory: [],
};

export const useGameStore = create<GameState>((set) => ({
    ...initialState,

    setScreen: (screen) => set({ currentScreen: screen }),

    setStoryID: (storyID) => set({ currentStoryID: storyID }),

    setFlag: (key, value) => set((state) => ({
        flags: { ...state.flags, [key]: value }
    })),

    addItem: (itemID, count) => set((state) => {
        const existing = state.inventory.find(item => item.itemID === itemID);
        if (existing) {
            return {
                inventory: state.inventory.map(item =>
                    item.itemID === itemID
                        ? { ...item, count: item.count + count }
                        : item
                )
            };
        }
        return {
            inventory: [...state.inventory, { itemID, count }]
        };
    }),

    resetGame: () => set(initialState),
}));
