import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHabitStore } from '../src/store/habitStore';
import { useProStore } from '../src/store/proStore';
import { cancelHabitReminder, scheduleHabitReminder } from '../src/utils/notifications';
const add = () =>
  useHabitStore
    .getState()
    .addHabit('Read', 'book', '#315E4C', {
      cue: 'After coffee',
      minimum: 'One page',
      weeklyTarget: 5,
    })!;
beforeEach(() => {
  useHabitStore.setState({ habits: [], logs: [] });
  useProStore.setState({ isPro: false });
});
describe('complete habit lifecycle', () => {
  it('undo restores the reminder for an unfinished habit', async () => {
    const id = add();
    await useHabitStore.getState().updateHabit(id, { reminderTime: '23:59' });
    useHabitStore.getState().checkIn(id, 'tiny');
    vi.mocked(scheduleHabitReminder).mockClear();
    useHabitStore.getState().toggleHabit(id);
    expect(scheduleHabitReminder).toHaveBeenCalledWith(id, 'Read', '23:59');
  });
  it('free users finish and graduate a journey, then start another', () => {
    const id = add();
    expect(add()).toBeNull();
    useHabitStore.getState().checkIn(id, 'tiny');
    useHabitStore.getState().checkIn(id, 'tiny');
    expect(useHabitStore.getState().logs).toHaveLength(1);
    expect(useHabitStore.getState().logs[0].effort).toBe('tiny');
    useHabitStore
      .getState()
      .reviewHabit(id, { feeling: 'adjust', minimum: 'One sentence', note: 'Even smaller' });
    useHabitStore.getState().graduateHabit(id);
    expect(useHabitStore.getState().habits[0]).toMatchObject({
      isGraduated: true,
      minimum: 'One sentence',
      reminderTime: null,
      totalFlowDays: 1,
    });
    expect(cancelHabitReminder).toHaveBeenCalledWith(id);
    expect(useHabitStore.getState().logs).toHaveLength(1);
    expect(add()).toBeTypeOf('string');
    expect(useHabitStore.getState().restartHabit(id)).toBe(false);
  });
  it('purchased Plus allows three, never four active habits', () => {
    useProStore.setState({ isPro: true });
    expect([add(), add(), add()].every(Boolean)).toBe(true);
    expect(add()).toBeNull();
  });
  it('undo removes the daily entry and invalid ids do not create records', () => {
    const id = add();
    useHabitStore.getState().checkIn(id, 'full');
    useHabitStore.getState().toggleHabit(id);
    useHabitStore.getState().checkIn('missing', 'tiny');
    expect(useHabitStore.getState().logs).toEqual([]);
    expect(useHabitStore.getState().restartHabit('missing')).toBe(false);
  });
  it('restart preserves history and delete removes only the selected habit', () => {
    const id = add();
    useHabitStore.getState().checkIn(id, 'full');
    useHabitStore.getState().graduateHabit(id);
    expect(useHabitStore.getState().restartHabit(id)).toBe(true);
    expect(useHabitStore.getState().logs).toHaveLength(1);
    useHabitStore.getState().deleteHabit(id);
    expect(useHabitStore.getState().habits).toEqual([]);
    expect(useHabitStore.getState().logs).toEqual([]);
  });
  it('failed reminder changes do not leave a silently changed plan', async () => {
    const id = add();
    vi.mocked(scheduleHabitReminder).mockRejectedValueOnce(new Error('OS failure'));
    await expect(
      useHabitStore.getState().updateHabit(id, { reminderTime: '09:00', name: 'Changed' }),
    ).rejects.toThrow();
    expect(useHabitStore.getState().habits[0]).toMatchObject({ name: 'Read', reminderTime: null });
  });
});
