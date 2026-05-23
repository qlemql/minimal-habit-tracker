import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { darkColors, creamColors } from '@/constants/theme';

type ThemeMode = 'dark' | 'cream' | 'system';

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
  completionBorder: string;
  completionBg: string;
};

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  getColors: () => ThemeColors;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'cream',

      setMode: (mode) => set({ mode }),

      getColors: () => {
        const { mode } = get();
        if (mode === 'system') {
          return Appearance.getColorScheme() === 'dark' ? darkColors : creamColors;
        }
        return mode === 'dark' ? darkColors : creamColors;
      },
    }),
    {
      name: 'theme-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted: any, version: number) => {
        if (version === 1 && persisted?.state?.mode === 'light') {
          persisted.state.mode = 'cream';
        }
        return persisted;
      },
    }
  )
);
