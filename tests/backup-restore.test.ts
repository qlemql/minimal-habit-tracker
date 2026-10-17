import { beforeEach, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHabitStore } from '../src/store/habitStore';
import { flushHabitStorage } from '../src/renewal/storage';
import { restoreBackup } from '../src/renewal/restoreBackup';
import type { Habit } from '../src/types/habit';

const old: Habit = { id: 'old', name: 'Original', icon: 'book', color: '#315E4C',
  reminderTime: null, order: 0, createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' };
const incoming = { habits: [{ ...old, id: 'new', name: 'Restored' }], logs: [] };
beforeEach(async () => {
  await flushHabitStorage().catch(() => {});
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();
  useHabitStore.setState({ habits: [old], logs: [], freeHabitId: old.id });
  await flushHabitStorage();
});
it('does not finish restoring until the data write completes', async () => {
  let complete!: () => void;
  vi.mocked(AsyncStorage.setItem).mockImplementationOnce(() => new Promise<void>((resolve) => { complete = resolve; }));
  let finished = false;
  const result = restoreBackup(incoming).then(() => { finished = true; });
  await vi.waitFor(() => expect(complete).toBeTypeOf('function'));
  expect(finished).toBe(false);
  complete();
  await result;
  expect(finished).toBe(true);
  expect(useHabitStore.getState().habits).toEqual(incoming.habits);
});
it('reports storage failure, restores the original state and permits a later retry', async () => {
  vi.mocked(AsyncStorage.setItem).mockRejectedValue(new Error('disk-full'));
  await expect(restoreBackup(incoming)).rejects.toThrow('disk-full');
  expect(useHabitStore.getState()).toMatchObject({ habits: [old], logs: [], freeHabitId: old.id });
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();
  await restoreBackup(incoming);
  expect(useHabitStore.getState()).toMatchObject({ ...incoming, freeHabitId: null });
});
