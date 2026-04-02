import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { darkColors, lightColors } from '@/constants/theme';

type ThemeMode = 'dark' | 'light' | 'system';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  success: string;
  inactive: string;
  danger: string;
};

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  getColors: () => ThemeColors;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'dark',

      setMode: (mode) => set({ mode }),

      getColors: () => {
        const { mode } = get();
        if (mode === 'system') {
          return Appearance.getColorScheme() === 'light' ? lightColors : darkColors;
        }
        return mode === 'light' ? lightColors : darkColors;
      },
    }),
    {
      name: 'theme-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => persisted as any,
    }
  )
);
