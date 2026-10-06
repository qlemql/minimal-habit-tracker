import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.unmock('@/utils/notifications');
vi.mock('@/renewal/preferences', () => ({
  usePreferences: { getState: () => ({ language: 'en' }) },
}));
const native = vi.hoisted(() => {
  const scheduled: {
    identifier: string;
    content: { data: { habitId: string; date?: string; kind: string } };
    trigger: { type: string; hour: number; minute: number };
  }[] = [];
  return {
    scheduled,
    setNotificationHandler: vi.fn(),
    setNotificationCategoryAsync: vi.fn(async () => {}),
    setNotificationChannelAsync: vi.fn(async () => {}),
    getPermissionsAsync: vi.fn(async () => ({ status: 'granted' })),
    requestPermissionsAsync: vi.fn(async () => ({ status: 'granted' })),
    getAllScheduledNotificationsAsync: vi.fn(async () => [...scheduled]),
    cancelScheduledNotificationAsync: vi.fn(async (id: string) => {
      const index = scheduled.findIndex((n) => n.identifier === id);
      if (index >= 0) scheduled.splice(index, 1);
    }),
    scheduleNotificationAsync: vi.fn(async (request: (typeof scheduled)[number]) => {
      scheduled.push(request);
      return request.identifier;
    }),
    SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
    AndroidImportance: { DEFAULT: 3 },
  };
});
vi.mock('expo-notifications', () => native);
import { useHabitStore } from '../src/store/habitStore';
import {
  scheduleHabitReminder,
  cancelHabitReminder,
  refreshHabitReminders,
  cancelTodayReminder,
} from '../src/utils/notifications';
import { localDate } from '../src/renewal/domain';
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-04T08:00:00'));
  native.scheduled.length = 0;
  useHabitStore.setState({
    habits: [
      {
        id: 'h',
        name: 'Read',
        icon: 'book',
        color: '#315E4C',
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reminderTime: '09:00',
        minimum: 'One page',
      },
    ],
    logs: [],
  });
});
afterEach(() => {
  vi.useRealTimers();
});
describe('native reminder scheduling contract', () => {
  it('keeps one daily recurring reminder after concurrent refreshes', async () => {
    await Promise.all([
      scheduleHabitReminder('h', 'Read', '09:00'),
      scheduleHabitReminder('h', 'Read', '09:00'),
    ]);
    expect(native.scheduled).toHaveLength(1);
    expect(native.scheduled[0].trigger).toMatchObject({ type: 'daily', hour: 9, minute: 0 });
  });
  it('completion does not cancel future repeating reminders', async () => {
    useHabitStore.setState({
      logs: [
        {
          id: 'l',
          habitId: 'h',
          date: localDate(),
          completed: true,
          completedAt: new Date().toISOString(),
          effort: 'tiny',
        },
      ],
    });
    await scheduleHabitReminder('h', 'Read', '09:00');
    await cancelTodayReminder('h');
    expect(native.scheduled).toHaveLength(1);
    expect(native.scheduled.some((n) => n.content.data.date === localDate())).toBe(false);
  });
  it('refund removes reminders until a free habit is selected', async () => {
    const first = useHabitStore.getState().habits[0];
    useHabitStore.setState({ habits: [first, { ...first, id: 'other' }], freeHabitId: null });
    await refreshHabitReminders();
    expect(native.scheduled).toHaveLength(0);
    useHabitStore.getState().selectFreeHabit('other');
    await refreshHabitReminders();
    expect(native.scheduled.map((item) => item.content.data.habitId)).toEqual(['other']);
  });
  it('foreground refresh never requests permission', async () => {
    native.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    await refreshHabitReminders();
    expect(native.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(native.scheduled).toHaveLength(0);
  });
  it('cancellation queued during scheduling removes all reminders', async () => {
    await Promise.all([scheduleHabitReminder('h', 'Read', '09:00'), cancelHabitReminder('h')]);
    expect(native.scheduled).toHaveLength(0);
  });
  it('invalid times fail without creating reminders', async () => {
    await expect(scheduleHabitReminder('h', 'Read', '25:99')).rejects.toThrow('invalid-reminder');
    expect(native.scheduled).toHaveLength(0);
  });
});
