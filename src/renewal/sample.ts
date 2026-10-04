import { useHabitStore } from '@/store/habitStore';
import { cancelHabitReminder } from '@/utils/notifications';
import { usePreferences } from './preferences';
import { localDate, shiftDate } from './domain';
import { palette } from './ui';
import type { Copy } from './copy';
import type { Habit, HabitLog } from '@/types/habit';

export const loadExample = (c: Copy): void => {
  if (useHabitStore.getState().habits.length) return;
  const today = localDate();
  const habits: Habit[] = [
    {
      id: 'sample-reading',
      name: c.reading,
      icon: '📖',
      color: palette.green,
      order: 0,
      createdAt: `${shiftDate(today, -16)}T12:00:00.000Z`,
      updatedAt: new Date().toISOString(),
      reminderTime: null,
      cue: c.readingCue,
      minimum: c.readingMin,
      weeklyTarget: 5,
      reviews: [
        {
          id: 'sample-review',
          date: shiftDate(today, -8),
          feeling: 'adjust',
          note: c.noRush,
          minimum: c.readingMin,
        },
      ],
    },
    {
      id: 'sample-writing',
      name: c.writing,
      icon: '✍️',
      color: palette.orange,
      order: 1,
      createdAt: `${shiftDate(today, -50)}T12:00:00.000Z`,
      updatedAt: new Date().toISOString(),
      reminderTime: null,
      cue: c.writingCue,
      minimum: c.writingMin,
      weeklyTarget: 5,
      isGraduated: true,
      graduatedAt: shiftDate(today, -10),
      totalFlowDays: 30,
    },
  ];
  const logs: HabitLog[] = [-1, -2, -4, -5, -7, -8, -9, -11, -12, -14, -15].map((offset) => ({
    id: `sample-log-${offset}`,
    habitId: 'sample-reading',
    date: shiftDate(today, offset),
    completed: true,
    completedAt: `${shiftDate(today, offset)}T12:00:00.000Z`,
    effort: offset === -2 ? 'tiny' : 'full',
  }));
  useHabitStore.setState({ habits, logs });
  usePreferences.getState().setExample(true);
  usePreferences.getState().welcome();
};
export const clearExample = (): void => {
  for (const habit of useHabitStore.getState().habits) {
    if (habit.id.startsWith('sample-')) void cancelHabitReminder(habit.id).catch(() => {});
  }
  useHabitStore.setState((state) => ({
    habits: state.habits.filter((habit) => !habit.id.startsWith('sample-')),
    logs: state.logs.filter((log) => !log.habitId.startsWith('sample-')),
  }));
  usePreferences.getState().setExample(false);
};
