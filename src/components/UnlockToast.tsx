import { useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useRewardStore } from '@/store/rewardStore';
import { useThemeStore } from '@/store/themeStore';
import { hapticNotification, NotificationFeedbackType } from '@/utils/haptics';
import { fontSize, spacing } from '@/constants/theme';

export function UnlockToast() {
  const pendingUnlock = useRewardStore((s) => s.pendingUnlock);
  const dismissUnlock = useRewardStore((s) => s.dismissUnlock);
  const colors = useThemeStore((s) => s.getColors());

  useEffect(() => {
    if (pendingUnlock) {
      hapticNotification(NotificationFeedbackType.Success);
    }
  }, [pendingUnlock]);

  const handleDismiss = useCallback(() => {
    dismissUnlock();
  }, [dismissUnlock]);

  // 자동 dismiss (5초)
  useEffect(() => {
    if (!pendingUnlock) return;
    const timer = setTimeout(handleDismiss, 5000);
    return () => clearTimeout(timer);
  }, [pendingUnlock, handleDismiss]);

  if (!pendingUnlock) return null;

  const previewItems = [
    ...(pendingUnlock.icons ?? []),
    ...(pendingUnlock.colors ?? []).map((c) => `●`),
  ].slice(0, 4);

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      exiting={FadeOutDown.duration(300)}
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      <Pressable onPress={handleDismiss} style={styles.inner}>
        <Text style={styles.emoji}>🎉</Text>
        <View style={styles.textArea}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {pendingUnlock.label} 달성!
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {pendingUnlock.description}
          </Text>
        </View>
        <View style={styles.preview}>
          {pendingUnlock.icons?.slice(0, 2).map((icon, i) => (
            <Text key={`icon-${i}`} style={styles.previewItem}>{icon}</Text>
          ))}
          {pendingUnlock.colors?.slice(0, 2).map((color, i) => (
            <View
              key={`color-${i}`}
              style={[styles.colorDot, { backgroundColor: color }]}
            />
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  textArea: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  description: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  preview: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  previewItem: {
    fontSize: 20,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
