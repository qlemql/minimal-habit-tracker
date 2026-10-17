import { localDate } from './domain';

export const isTodaysReminder = (data: Record<string, unknown>, deliveredAt: number): boolean => {
  if (data.kind === 'daily-reminder') {
    const delivered = new Date(deliveredAt);
    return Number.isFinite(delivered.getTime()) && deliveredAt <= Date.now() &&
      localDate(delivered) === localDate();
  }
  return data.date === localDate();
};
