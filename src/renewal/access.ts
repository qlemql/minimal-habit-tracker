import type { Habit } from '@/types/habit';

export const trackableHabits = (
  habits: Habit[],
  pro: boolean,
  freeHabitId?: string | null,
): Habit[] => {
  const active = habits.filter((habit) => !habit.isGraduated);
  if (pro || active.length <= 1) return active;
  return active.filter((habit) => habit.id === freeHabitId);
};
