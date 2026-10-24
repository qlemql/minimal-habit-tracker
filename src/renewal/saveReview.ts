import { useHabitStore } from '@/store/habitStore';
import { flushHabitStorage } from './storage';
import { scheduleHabitReminder } from '@/utils/notifications';
import type { HabitReview } from '@/types/habit';

export const saveReview = async (id: string, review: Omit<HabitReview, 'id' | 'date'>): Promise<void> => {
  const before = useHabitStore.getState().habits.find((habit) => habit.id === id);
  if (!before) throw new Error('habit-not-found');
  useHabitStore.getState().reviewHabit(id, review);
  const updated = useHabitStore.getState().habits.find((habit) => habit.id === id);
  if (updated === before) throw new Error('review-not-saved');
  try {
    await flushHabitStorage();
  } catch (error) {
    // Roll back only this edit. Never undo a newer change or a different habit's record.
    useHabitStore.setState((state) => ({ habits: state.habits.map((habit) => habit === updated ? before : habit) }));
    await flushHabitStorage().catch(() => {});
    throw error;
  }
  const current = useHabitStore.getState().habits.find((habit) => habit.id === id);
  if (current?.reminderTime && !current.isGraduated) {
    void scheduleHabitReminder(id, current.name, current.reminderTime).catch(() => {});
  }
};
