import { useHabitStore } from '@/store/habitStore';
import type { HabitData } from './domain';
import { flushHabitStorage } from './storage';

// Do not acknowledge a restore until its records have reached persistent storage.
export const restoreBackup = async (data: Pick<HabitData, 'habits' | 'logs'>) => {
  await flushHabitStorage().catch(() => {});
  const { habits, logs, freeHabitId } = useHabitStore.getState();
  useHabitStore.setState({ ...data, freeHabitId: null });
  try {
    await flushHabitStorage();
  } catch (error) {
    useHabitStore.setState({ habits, logs, freeHabitId });
    // Keep the original records in memory even if the device still cannot write.
    await flushHabitStorage().catch(() => {});
    throw error;
  }
};
