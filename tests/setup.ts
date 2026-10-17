import { vi } from 'vitest';
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => {}),
    removeItem: vi.fn(async () => {}),
  },
}));
vi.mock('@/utils/notifications', () => ({
  cancelHabitReminder: vi.fn(async () => {}),
  cancelTodayReminder: vi.fn(async () => {}),
  scheduleHabitReminder: vi.fn(async () => {}),
}));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
