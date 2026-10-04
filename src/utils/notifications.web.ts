export const HABIT_TOGGLE_CATEGORY = 'habit-toggle';
export const HABIT_TOGGLE_ACTION = 'toggle';
export const setupNotificationCategories = async (): Promise<void> => {};
export const requestNotificationPermission = async (): Promise<boolean> => false;
export const scheduleHabitReminder = async (
  _id: string,
  _name: string,
  _time: string,
): Promise<void> => {};
export const cancelHabitReminder = async (_id: string): Promise<void> => {};
export const cancelTodayReminder = async (_id: string): Promise<void> => {};
export const rescheduleAllReminders = async (): Promise<void> => {};
export const refreshHabitReminders = rescheduleAllReminders;
