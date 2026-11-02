import { useHabitStore } from '@/store/habitStore';
import { localDate } from './domain';
import { flushHabitStorage, withHabitWriteSource } from './storage';

export const completeReminder = async (id: string): Promise<void> => {
  const store = useHabitStore.getState();
  if (!store.isHabitCompleted(id, localDate()))
    withHabitWriteSource('notification', () => store.checkIn(id, 'full'));
  // Retry persisting a previous in-memory completion before acknowledging the OS action.
  withHabitWriteSource('notification', () => useHabitStore.setState({}));
  await flushHabitStorage();
};
