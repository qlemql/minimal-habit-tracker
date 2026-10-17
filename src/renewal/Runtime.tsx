import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useHabitStore } from '@/store/habitStore';
import {
  setupNotificationCategories,
  refreshHabitReminders,
  HABIT_TOGGLE_ACTION,
} from '@/utils/notifications';
import { syncWidgetData, processPendingWidgetToggles } from '@/utils/widgetData';
import { syncPurchase, listenToPurchaseUpdates } from './billing';
import { useProStore } from '@/store/proStore';
import { isTodaysReminder } from './notificationAction';
import { usePreferences } from './preferences';

export const Runtime = () => {
  const language = usePreferences((state) => state.language);
  useEffect(() => {
    let disposed = false;
    let stopPurchases = () => {};
    void listenToPurchaseUpdates().then((stop) => {
      if (disposed) stop();
      else stopPurchases = stop;
    }).catch(() => {});
    const refresh = async () => {
      try {
        await processPendingWidgetToggles();
        await syncWidgetData();
        await setupNotificationCategories();
        await refreshHabitReminders();
      } catch {
        /* Device permissions may be unavailable. */
      }
      try {
        await syncPurchase();
      } catch {
        /* Keep the last verified entitlement while offline. */
      }
    };
    const handle = async (response: Notifications.NotificationResponse | null) => {
      if (!response || response.actionIdentifier !== HABIT_TOGGLE_ACTION) return;
      const id: unknown = response.notification.request.content.data.habitId;
      if (typeof id !== 'string') return;
      if (!isTodaysReminder(response.notification.request.content.data, response.notification.date)) {
        await Notifications.clearLastNotificationResponseAsync();
        return;
      }
      // An explicit Done action is idempotent, including replay after a cold start.
      useHabitStore.getState().checkIn(id, 'full');
      await Notifications.clearLastNotificationResponseAsync();
      await syncWidgetData();
    };
    const initialize = async () => {
      await refresh();
      try {
        await handle(await Notifications.getLastNotificationResponseAsync());
      } catch {}
    };
    void initialize();
    const notification = Notifications.addNotificationResponseReceivedListener((response) => {
      void handle(response).catch(() => {});
    });
    const foreground = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    const accessChanged = () => {
      void refreshHabitReminders().catch(() => {});
      void syncWidgetData().catch(() => {});
    };
    const pro = useProStore.subscribe(accessChanged);
    const store = useHabitStore.subscribe((state, previous) => {
      void syncWidgetData().catch(() => {});
      if (state.freeHabitId !== previous.freeHabitId) accessChanged();
    });
    return () => {
      notification.remove();
      foreground.remove();
      store();
      pro();
      disposed = true;
      stopPurchases();
    };
  }, [language]);
  return null;
};
