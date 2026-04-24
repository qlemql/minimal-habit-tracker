import { useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useRewardStore } from '@/store/rewardStore';
import { useThemeStore } from '@/store/themeStore';
import { hapticNotification, NotificationFeedbackType } from '@/utils/haptics';
import { fontSize, spacing } from '@/constants/theme';
import { getCurrentStage } from '@/constants/growth';

export function UnlockToast() {
  const pendingUnlock = useRewardStore((s) => s.pendingUnlock);
  const dismissUnlock = useRewardStore((s) => s.dismissUnlock);
  const colors = useThemeStore((s) => s.getColors());

  const stage = useMemo(
    () => (pendingUnlock ? getCurrentStage(pendingUnlock.flowDays) : null),
    [pendingUnlock]
  );

  useEffect(() => {
    if (pendingUnlock) {
      hapticNotification(NotificationFeedbackType.Success);
    }
  }, [pendingUnlock]);

  const handleDismiss = useCallback(() => {
    dismissUnlock();
  }, [dismissUnlock]);

  useEffect(() => {
    if (!pendingUnlock) return;
    const timer = setTimeout(handleDismiss, 5000);
    return () => clearTimeout(timer);
  }, [pendingUnlock, handleDismiss]);

  if (!pendingUnlock || !stage) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      exiting={FadeOutDown.duration(300)}
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.accent },
      ]}
    >
      <Pressable onPress={handleDismiss} style={styles.inner}>
        <View style={[styles.stageBadge, { backgroundColor: `${colors.accent}1A` }]}>
          <Text style={styles.stageEmoji}>{stage.emoji}</Text>
        </View>
        <View style={styles.textArea}>
          <Text style={[styles.stageLabel, { color: colors.accent }]}>
            {stage.label}으로 자랐어요
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
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm + 2,
  },
  stageBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageEmoji: {
    fontSize: 28,
  },
  textArea: {
    flex: 1,
  },
  stageLabel: {
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
