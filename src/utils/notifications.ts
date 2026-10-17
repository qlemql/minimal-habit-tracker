import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { usePreferences } from '@/renewal/preferences';
import { copies } from '@/renewal/copy';
import { localDate } from '@/renewal/domain';

export const HABIT_TOGGLE_CATEGORY = 'HABIT_TOGGLE';
export const HABIT_TOGGLE_ACTION = 'toggle';
const CHANNEL = 'ssak-practice';
const queues = new Map<string, Promise<void>>();
const copy = () => copies[usePreferences.getState().language];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export const setupNotificationCategories = async (): Promise<void> => {
  await Notifications.setNotificationCategoryAsync(HABIT_TOGGLE_CATEGORY, [
    {
      identifier: HABIT_TOGGLE_ACTION,
      buttonTitle: copy().done,
      options: { opensAppToForeground: true },
    },
  ]);
};
const setupChannel = async () => {
  if (Platform.OS === 'android')
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: copy().reminder,
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });
};
export const requestNotificationPermission = async (): Promise<boolean> => {
  await setupChannel();
  if ((await Notifications.getPermissionsAsync()).status === 'granted') return true;
  return (await Notifications.requestPermissionsAsync()).status === 'granted';
};
const cancelMatching = async (habitId: string, todayOnly = false) => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(
        (item) =>
          item.content.data?.habitId === habitId &&
          (!todayOnly || item.content.data?.date === localDate()),
      )
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
};
const enqueue = (id: string, operation: () => Promise<void>): Promise<void> => {
  const next = (queues.get(id) ?? Promise.resolve()).catch(() => {}).then(operation);
  queues.set(id, next);
  void next
    .finally(() => {
      if (queues.get(id) === next) queues.delete(id);
    })
    .catch(() => {});
  return next;
};
export const cancelHabitReminder = (habitId: string): Promise<void> =>
  enqueue(habitId, () => cancelMatching(habitId));
export const cancelTodayReminder = (habitId: string): Promise<void> =>
  enqueue(habitId, () => cancelMatching(habitId, true));
export const scheduleHabitReminder = (
  habitId: string,
  habitName: string,
  timeString: string,
): Promise<void> =>
  enqueue(habitId, async () => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(timeString)) throw new Error('invalid-reminder');
    await cancelMatching(habitId);
    // Only the editor requests permission. Opening or restoring the app never prompts.
    if ((await Notifications.getPermissionsAsync()).status !== 'granted') return;
    await setupChannel();
    await setupNotificationCategories();
    const { useHabitStore } = await import('@/store/habitStore');
    const current = useHabitStore.getState().habits.find((habit) => habit.id === habitId);
    if (!current || !useHabitStore.getState().canTrackHabit(habitId) || current.reminderTime !== timeString) return;
    const [hour, minute] = timeString.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      identifier: `ssak-${habitId}-daily`,
      content: {
        title: habitName,
        body: current.minimum || copy().heroSub,
        data: { habitId, kind: 'daily-reminder' },
        categoryIdentifier: HABIT_TOGGLE_CATEGORY,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour, minute, channelId: CHANNEL,
      },
    });
  });
export const rescheduleAllReminders = async (): Promise<void> => {
  const { useHabitStore } = await import('@/store/habitStore');
  const habits = useHabitStore.getState().habits;
  for (const habit of habits) {
    if (!useHabitStore.getState().canTrackHabit(habit.id) || !habit.reminderTime) await cancelHabitReminder(habit.id);
    else await scheduleHabitReminder(habit.id, habit.name, habit.reminderTime);
  }
};
export const refreshHabitReminders = rescheduleAllReminders;
