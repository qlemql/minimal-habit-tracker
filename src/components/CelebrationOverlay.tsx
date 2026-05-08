import { useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { NotificationFeedbackType } from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { hapticNotification } from '@/utils/haptics';
import { useThemeStore } from '@/store/themeStore';
import {
  getCurrentStage,
  getDaysUntilNextStage,
  getNextStage,
  shouldShowProximityHint,
} from '@/constants/growth';
import { fontSize, spacing } from '@/constants/theme';

const MESSAGE_COUNT = 4;

interface CelebrationOverlayProps {
  visible: boolean;
  currentMaxFlow: number;
  onDone: () => void;
}

export function CelebrationOverlay({ visible, currentMaxFlow, onDone }: CelebrationOverlayProps) {
  const { t } = useTranslation();
  const colors = useThemeStore((s) => s.getColors());

  const stage = useMemo(() => getCurrentStage(currentMaxFlow), [currentMaxFlow]);
  const stageLabel = t(`growth.stage.${stage.id}` as const);
  const nextStage = useMemo(() => getNextStage(currentMaxFlow), [currentMaxFlow]);
  const daysToNext = useMemo(() => getDaysUntilNextStage(currentMaxFlow), [currentMaxFlow]);
  const showHint = useMemo(() => shouldShowProximityHint(currentMaxFlow), [currentMaxFlow]);

  const message = useMemo(() => {
    const idx = Math.floor(Math.random() * MESSAGE_COUNT);
    return t(`components.celebration.message.${idx}` as const);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, t]);

  const scale = useSharedValue(0);
  const bgOpacity = useSharedValue(0);
  const hintOpacity = useSharedValue(0);

  const handleDone = useCallback(() => {
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (visible) {
      hapticNotification(NotificationFeedbackType.Success);

      bgOpacity.value = withSequence(
        withTiming(1, { duration: 220 }),
        withDelay(1500, withTiming(0, { duration: 380 }, (finished) => {
          if (finished) {
            runOnJS(handleDone)();
          }
        }))
      );

      scale.value = withSequence(
        withSpring(1.15, { damping: 9, stiffness: 180 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );

      hintOpacity.value = withDelay(
        500,
        withTiming(1, { duration: 400 })
      );
    } else {
      scale.value = 0;
      bgOpacity.value = 0;
      hintOpacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onDone}>
      <Animated.View style={[styles.container, { backgroundColor: `${colors.background}F2` }, bgStyle]}>
        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.emoji}>{stage.emoji}</Text>
          <Text style={[styles.text, { color: colors.textPrimary }]}>{message}</Text>
          <Text style={[styles.stageLabel, { color: colors.accent }]}>{stageLabel}</Text>
        </Animated.View>

        {showHint && nextStage && daysToNext !== null && (
          <Animated.View style={[styles.hintContainer, hintStyle]}>
            <View style={[styles.hintDivider, { backgroundColor: colors.inactive }]} />
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
              {t('components.celebration.daysToNext', { days: daysToNext, emoji: nextStage.emoji })}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 96,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  stageLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    gap: spacing.sm,
  },
  hintDivider: {
    width: 32,
    height: 1,
  },
  hintText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
