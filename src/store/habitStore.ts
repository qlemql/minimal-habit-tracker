import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { habitStorage } from '@/renewal/storage';
import { trackableHabits } from '@/renewal/access';
import { localDate, migrateHabitData } from '@/renewal/domain';
import {
  cancelHabitReminder,
  cancelTodayReminder,
  scheduleHabitReminder,
} from '@/utils/notifications';
import { useProStore } from './proStore';
import type { Habit, HabitLog, HabitReview } from '@/types/habit';

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
type HabitUpdates = Partial<
  Pick<Habit, 'name' | 'icon' | 'color' | 'reminderTime' | 'cue' | 'minimum' | 'weeklyTarget'>
>;
interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];
  legacyAccess: boolean;
  freeHabitId: string | null;
  selectFreeHabit: (id: string) => void;
  canTrackHabit: (id: string) => boolean;
  widgetEventIds: string[];
  applyWidgetEvent: (id: string, date: string, completed: boolean, eventId?: string) => void;
  addHabit: (name: string, icon: string, color: string, details?: HabitUpdates) => string | null;
  updateHabit: (id: string, updates: HabitUpdates) => Promise<void>;
  deleteHabit: (id: string) => void;
  graduateHabit: (id: string) => void;
  restartHabit: (id: string) => boolean;
  reviewHabit: (id: string, review: Omit<HabitReview, 'id' | 'date'>) => void;
  getActiveHabits: () => Habit[];
  getGraduatedHabits: () => Habit[];
  toggleHabit: (id: string, date?: string) => void;
  checkIn: (id: string, effort: 'full' | 'tiny') => void;
  getLogsForDate: (date: string) => HabitLog[];
  isHabitCompleted: (id: string, date: string) => boolean;
  canAddHabit: () => boolean;
}
export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],
      legacyAccess: false,
      freeHabitId: null,
      widgetEventIds: [],
      selectFreeHabit: (id) => {
        if (get().habits.some((habit) => habit.id === id && !habit.isGraduated))
          set({ freeHabitId: id });
      },
      canTrackHabit: (id) => trackableHabits(
        get().habits, useProStore.getState().isPro, get().legacyAccess, get().freeHabitId,
      ).some((habit) => habit.id === id),
      applyWidgetEvent: (id, date, completed, eventId) => {
        if (eventId && get().widgetEventIds.includes(eventId)) return;
        // Widget events may legitimately arrive days later. Preserve the day tapped.
        if (!get().habits.some((habit) => habit.id === id)) return;
        const parsed = new Date(`${date}T12:00:00`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) ||
            localDate(parsed) !== date || date > localDate()) return;
        set((state) => ({
          widgetEventIds: eventId ? [...state.widgetEventIds, eventId].slice(-2000) : state.widgetEventIds,
          logs: [
          ...state.logs.filter((log) => log.habitId !== id || log.date !== date),
          ...(completed ? [{ id: `${id}/${date}`, habitId: id, date, completed: true,
            effort: 'full' as const, completedAt: new Date().toISOString() }] : []),
        ] }));
      },
      addHabit: (name, icon, color, details = {}) => {
        if (!get().canAddHabit() || !name.trim()) return null;
        const now = new Date().toISOString();
        const id = generateId();
        const habit: Habit = {
          id,
          name: name.trim(),
          icon,
          color,
          reminderTime: null,
          order: get().habits.reduce((max, item) => Math.max(max, item.order), -1) + 1,
          createdAt: now,
          updatedAt: now,
          ...details,
        };
        set((state) => ({ habits: [...state.habits, habit] }));
        return id;
      },
      updateHabit: async (id, updates) => {
        if (!get().canTrackHabit(id)) throw new Error('habit-read-only');
        const habit = get().habits.find((item) => item.id === id);
        if (!habit) return;
        const next = { ...habit, ...updates, updatedAt: new Date().toISOString() };
        set((state) => ({ habits: state.habits.map((item) => (item.id === id ? next : item)) }));
        try {
          if (
            updates.reminderTime !== undefined ||
            ((updates.name !== undefined || updates.minimum !== undefined) && next.reminderTime)
          ) {
            if (next.reminderTime && !next.isGraduated)
              await scheduleHabitReminder(id, next.name, next.reminderTime);
            else await cancelHabitReminder(id);
          }
        } catch (error) {
          set((state) => ({ habits: state.habits.map((item) => (item === next ? habit : item)) }));
          throw error;
        }
      },
      deleteHabit: (id) => {
        void cancelHabitReminder(id).catch(() => {});
        set((state) => ({
          habits: state.habits.filter((item) => item.id !== id),
          logs: state.logs.filter((item) => item.habitId !== id),
        }));
      },
      graduateHabit: (id) => {
        void cancelHabitReminder(id).catch(() => {});
        const count = new Set(
          get()
            .logs.filter((log) => log.habitId === id && log.completed)
            .map((log) => log.date),
        ).size;
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id && !habit.isGraduated
              ? {
                  ...habit,
                  isGraduated: true,
                  graduatedAt: localDate(),
                  totalFlowDays: count,
                  reminderTime: null,
                  updatedAt: new Date().toISOString(),
                }
              : habit,
          ),
        }));
      },
      restartHabit: (id) => {
        if (
          !get().canAddHabit() ||
          !get().habits.some((habit) => habit.id === id && habit.isGraduated)
        )
          return false;
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  isGraduated: false,
                  restartedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : habit,
          ),
        }));
        return true;
      },
      reviewHabit: (id, review) => {
        if (!get().canTrackHabit(id)) return;
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  minimum: review.minimum.trim(),
                  updatedAt: new Date().toISOString(),
                  reviews: [
                    ...(habit.reviews ?? []),
                    { ...review, id: generateId(), date: localDate() },
                  ],
                }
              : habit,
          ),
        }));
        const current = get().habits.find((habit) => habit.id === id);
        if (current?.reminderTime && !current.isGraduated) {
          void scheduleHabitReminder(id, current.name, current.reminderTime).catch(() => {});
        }
      },
      getActiveHabits: () => get().habits.filter((habit) => !habit.isGraduated),
      getGraduatedHabits: () =>
        get()
          .habits.filter((habit) => habit.isGraduated)
          .sort((a, b) => (b.graduatedAt ?? '').localeCompare(a.graduatedAt ?? '')),
      checkIn: (id, effort) => {
        if (!get().canTrackHabit(id)) return;
        if (!get().habits.some((habit) => habit.id === id && !habit.isGraduated)) return;
        const date = localDate();
        set((state) => ({
          logs: [
            ...state.logs.filter((log) => log.habitId !== id || log.date !== date),
            {
              id: `${id}/${date}`,
              habitId: id,
              date,
              completed: true,
              completedAt: new Date().toISOString(),
              effort,
            },
          ],
        }));
        void cancelTodayReminder(id).catch(() => {});
      },
      toggleHabit: (id, date) => {
        if (!get().canTrackHabit(id)) return;
        if (date && date !== localDate()) return;
        if (!get().habits.some((habit) => habit.id === id && !habit.isGraduated)) return;
        if (!get().isHabitCompleted(id, localDate())) {
          get().checkIn(id, 'full');
          return;
        }
        set((state) => ({
          logs: state.logs.filter((log) => log.habitId !== id || log.date !== localDate()),
        }));
        const habit = get().habits.find((item) => item.id === id);
        if (habit?.reminderTime) {
          void scheduleHabitReminder(id, habit.name, habit.reminderTime).catch(() => {});
        }
      },
      getLogsForDate: (date) => get().logs.filter((log) => log.date === date),
      isHabitCompleted: (id, date) =>
        get().logs.some((log) => log.habitId === id && log.date === date && log.completed),
      canAddHabit: () =>
        get().getActiveHabits().length <
        (get().legacyAccess || useProStore.getState().isPro ? 3 : 1),
    }),
    {
      name: 'habit-store',
      version: 2,
      storage: createJSONStorage(() => habitStorage),
      migrate: (state, version) => migrateHabitData(state, version),
    },
  ),
);
