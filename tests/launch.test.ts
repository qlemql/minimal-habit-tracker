import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useHabitStore } from '../src/store/habitStore';
import { useProStore } from '../src/store/proStore';
import { isTodaysReminder } from '../src/renewal/notificationAction';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-04T10:00:00'));
  useHabitStore.setState({ habits: [], logs: [], legacyAccess: false, freeHabitId: null });
  useProStore.setState({ isPro: true });
});
afterEach(() => vi.useRealTimers());
const add = (name = 'Read') => useHabitStore.getState().addHabit(name, 'book', '#315E4C')!;

describe('purchase access changes', () => {
  it('preserves all records after a refund and enforces the free choice at the store boundary', async () => {
    const one = add(); const two = add('Walk');
    useHabitStore.getState().checkIn(two, 'tiny');
    const saved = useHabitStore.getState().logs;
    useProStore.getState().setPro(false);
    useHabitStore.getState().checkIn(one, 'full');
    expect(useHabitStore.getState().logs).toEqual(saved);
    useHabitStore.getState().selectFreeHabit(one);
    useHabitStore.getState().checkIn(one, 'full');
    useHabitStore.getState().toggleHabit(two);
    await expect(useHabitStore.getState().updateHabit(two, { name: 'Lost' })).rejects.toThrow('read-only');
    useHabitStore.getState().reviewHabit(two, { feeling: 'easy', minimum: 'Less', note: '' });
    expect(useHabitStore.getState().logs).toHaveLength(2);
    expect(useHabitStore.getState().habits[1]).toMatchObject({ name: 'Walk' });
    expect(useHabitStore.getState().habits[1].reviews).toBeUndefined();
    useHabitStore.getState().selectFreeHabit(two);
    expect(useHabitStore.getState().canTrackHabit(two)).toBe(true);
    expect(useHabitStore.getState().canTrackHabit(one)).toBe(false);
    useProStore.getState().setPro(true);
    expect(useHabitStore.getState().canTrackHabit(one)).toBe(true);
  });
  it('keeps legacy access and recovers when the selected habit is removed', () => {
    const one = add(); const two = add();
    useProStore.getState().setPro(false);
    useHabitStore.setState({ legacyAccess: true });
    expect(useHabitStore.getState().canTrackHabit(two)).toBe(true);
    useHabitStore.setState({ legacyAccess: false });
    useHabitStore.getState().selectFreeHabit(one);
    useHabitStore.getState().deleteHabit(one);
    expect(useHabitStore.getState().canTrackHabit(two)).toBe(true);
  });
});
describe('dated native actions', () => {
  it('imports yesterday without altering today, tolerates replay, and supports undo', () => {
    const id = add();
    useHabitStore.getState().checkIn(id, 'tiny');
    const store = useHabitStore.getState();
    store.applyWidgetEvent(id, '2026-10-03', true);
    store.applyWidgetEvent(id, '2026-10-03', true);
    expect(useHabitStore.getState().logs).toHaveLength(2);
    store.applyWidgetEvent(id, '2026-10-03', false);
    expect(useHabitStore.getState().logs).toHaveLength(1);
    expect(useHabitStore.getState().logs[0].effort).toBe('tiny');
    store.applyWidgetEvent(id, '2026-10-05', true);
    store.applyWidgetEvent(id, '2026-02-30', true);
    store.applyWidgetEvent('deleted', '2026-10-03', true);
    expect(useHabitStore.getState().logs).toHaveLength(1);
  });
  it('rejects yesterday and future notification delivery dates', () => {
    const data = { kind: 'daily-reminder' };
    expect(isTodaysReminder(data, new Date('2026-10-03T23:59:00').getTime())).toBe(false);
    expect(isTodaysReminder(data, new Date('2026-10-04T09:00:00').getTime())).toBe(true);
    expect(isTodaysReminder(data, Date.now() + 10000)).toBe(false);
    expect(isTodaysReminder(data, NaN)).toBe(false);
    expect(isTodaysReminder({ date: '2026-10-04' }, 0)).toBe(true);
  });
});
