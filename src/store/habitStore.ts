import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 네이티브 의존성 없는 UUID 생성
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
import { Habit, HabitLog } from '@/types/habit';
import { getToday } from '@/utils/date';
import { scheduleHabitReminder, cancelHabitReminder } from '@/utils/notifications';
// Pro 기능은 v1.1에서 활성화
// import { useProStore } from './proStore';

const MAX_FREE_HABITS = 3;

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];

  // 습관 CRUD — addHabit은 생성된 습관 ID를 반환 (null이면 제한 초과)
  addHabit: (name: string, icon: string, color: string) => string | null;
  updateHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'icon' | 'color' | 'reminderTime'>>) => Promise<void>;
  deleteHabit: (id: string) => void;

  // 로그
  toggleHabit: (habitId: string, date?: string) => void;
  getLogsForDate: (date: string) => HabitLog[];
  isHabitCompleted: (habitId: string, date: string) => boolean;

  // 제한
  canAddHabit: () => boolean;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],

      addHabit: (name, icon, color) => {
        if (!get().canAddHabit()) return null;

        const now = new Date().toISOString();
        const id = generateId();
        const newHabit: Habit = {
          id,
          name,
          icon,
          color,
          reminderTime: null,
          order: get().habits.length,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ habits: [...state.habits, newHabit] }));
        return id;
      },

      updateHabit: async (id, updates) => {
        const habit = get().habits.find((h) => h.id === id);
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? { ...h, ...updates, updatedAt: new Date().toISOString() }
              : h
          ),
        }));

        // 알림 시간이 변경된 경우
        if (updates.reminderTime !== undefined && habit) {
          const name = updates.name ?? habit.name;
          if (updates.reminderTime) {
            await scheduleHabitReminder(id, name, updates.reminderTime);
          } else {
            await cancelHabitReminder(id);
          }
        }
      },

      deleteHabit: (id) => {
        cancelHabitReminder(id);
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          logs: state.logs.filter((l) => l.habitId !== id),
        }));
      },

      toggleHabit: (habitId, date) => {
        const targetDate = date ?? getToday();
        // 오늘만 수정 가능 — 과거/미래 날짜 조작 방지
        if (targetDate !== getToday()) return;
        const existing = get().logs.find(
          (l) => l.habitId === habitId && l.date === targetDate
        );

        if (existing) {
          set((state) => ({
            logs: state.logs.map((l) =>
              l.id === existing.id
                ? {
                    ...l,
                    completed: !l.completed,
                    completedAt: !l.completed ? new Date().toISOString() : null,
                  }
                : l
            ),
          }));
        } else {
          const newLog: HabitLog = {
            id: generateId(),
            habitId,
            date: targetDate,
            completed: true,
            completedAt: new Date().toISOString(),
          };
          set((state) => ({ logs: [...state.logs, newLog] }));
        }
      },

      getLogsForDate: (date) => {
        return get().logs.filter((l) => l.date === date);
      },

      isHabitCompleted: (habitId, date) => {
        return get().logs.some(
          (l) => l.habitId === habitId && l.date === date && l.completed
        );
      },

      canAddHabit: () => {
        return get().habits.length < MAX_FREE_HABITS;
      },
    }),
    {
      name: 'habit-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => persisted as any,
      onRehydrateStorage: () => {
        return () => {
          // 스토어 복원 완료 후 위젯 데이터 동기화
          try {
            const { syncWidgetData } = require('@/utils/widgetData');
            syncWidgetData();
          } catch (e) {
            console.warn('[Widget] Hydration sync failed:', e);
          }
        };
      },
    }
  )
);
