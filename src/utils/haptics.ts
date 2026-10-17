import * as Haptics from 'expo-haptics';

export function hapticImpact(style: Haptics.ImpactFeedbackStyle) {
  try {
    void Haptics.impactAsync(style).catch(() => {});
  } catch {}
}

export function hapticNotification(type: Haptics.NotificationFeedbackType) {
  try {
    Haptics.notificationAsync(type);
  } catch {}
}

export function hapticSelection() {
  try {
    Haptics.selectionAsync();
  } catch {}
}

export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
