import { useHabitStore } from '@/store/habitStore';
import { localDate } from './domain';
import { flushHabitStorage } from './storage';

export const completeReminder = async (id: string): Promise<void> => {
  const store = useHabitStore.getState();
  if (!store.isHabitCompleted(id, localDate())) store.checkIn(id, 'full');
  // Retry persisting a previous in-memory completion before acknowledging the OS action.
  useHabitStore.setState({});
  await flushHabitStorage();
};
