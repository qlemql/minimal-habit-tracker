import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  runOnJS,
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';
import { useThemeStore } from '@/store/themeStore';
import { fontSize, spacing } from '@/constants/theme';
import type { FlowResult } from '@/utils/streak';
import { getCurrentStage, GROWTH_STAGES } from '@/constants/growth';

interface HabitCardProps {
  name: string;
  icon: string;
  color: string;
  completed: boolean;
  flow: FlowResult;
  reminderTime?: string | null;
  completionIndex?: number;
  totalHabits?: number;
  onToggle: () => void;
  onEdit?: () => void;
}

export function HabitCard({
  name,
  icon,
  color,
  completed,
  flow,
  reminderTime,
  completionIndex = 0,
  totalHabits = 1,
  onToggle,
  onEdit,
}: HabitCardProps) {
  const { t } = useTranslation();
  const colors = useThemeStore((s) => s.getColors());
  const scale = useSharedValue(1);
  const completionProgress = useSharedValue(completed ? 1 : 0);
  const checkScale = useSharedValue(completed ? 1 : 0.6);

  useEffect(() => {
    completionProgress.value = completed
      ? withTiming(1, { duration: 280 })
      : withTiming(0, { duration: 180 });
    checkScale.value = completed
      ? withTiming(1, { duration: 180 })
      : withTiming(0.6, { duration: 120 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  const handleToggle = () => {
    // 짧고 출렁임 없는 press 피드백
    scale.value = withSequence(
      withTiming(0.985, { duration: 50 }),
      withTiming(1, { duration: 80 })
    );
    if (!completed) {
      if (completionIndex >= totalHabits - 1) {
        hapticNotification(NotificationFeedbackType.Success);
      } else if (completionIndex >= totalHabits - 2) {
        hapticImpact(ImpactFeedbackStyle.Heavy);
      } else {
        hapticImpact(ImpactFeedbackStyle.Medium);
      }
    } else {
      hapticImpact(ImpactFeedbackStyle.Light);
    }
    onToggle();
  };

  const longPressGesture = Gesture.LongPress()
    .minDuration(450)
    .onBegin(() => {
      scale.value = withTiming(0.97, { duration: 200 });
    })
    // minDuration 충족 즉시(손가락 떼기 전) 자동 진입 — 일반 앱 패턴
    .onStart(() => {
      if (onEdit) {
        runOnJS(hapticImpact)(ImpactFeedbackStyle.Heavy);
        runOnJS(onEdit)();
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleToggle)();
  });

  const composedGesture = Gesture.Exclusive(longPressGesture, tapGesture);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      completionProgress.value,
      [0, 1],
      [colors.surface, colors.completionBg]
    ),
  }));

  const iconBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      completionProgress.value,
      [0, 1],
      ['transparent', colors.completionBorder]
    ),
  }));

  const checkOverlayStyle = useAnimatedStyle(() => ({
    opacity: completionProgress.value,
    transform: [{ scale: checkScale.value }],
  }));

  const stage = getCurrentStage(flow.longestFlow);
  const showStage = flow.longestFlow >= GROWTH_STAGES[1].threshold;
  const showFlow = flow.currentFlowDays > 1;
  const stageLabel = t(`growth.stage.${stage.id}` as const);

  const a11yLabel = [
    name,
    t(completed ? 'components.habitCard.a11y.completed' : 'components.habitCard.a11y.incomplete'),
    showStage ? t('components.habitCard.a11y.stage', { label: stageLabel }) : '',
    showFlow ? t('components.habitCard.a11y.flow', { days: flow.currentFlowDays }) : '',
    reminderTime ? t('components.habitCard.a11y.reminder', { time: reminderTime }) : '',
  ].filter(Boolean).join(' ');

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[styles.card, cardAnimStyle]}
        accessibilityLabel={a11yLabel}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityHint={t('components.habitCard.a11y.hint')}
      >
        <View style={styles.left}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Text style={styles.icon}>{icon}</Text>
            <Animated.View style={[styles.iconBorder, iconBorderStyle]} pointerEvents="none" />
            <Animated.View
              style={[
                styles.checkOverlay,
                {
                  backgroundColor: colors.completionBorder,
                  borderColor: colors.background,
                },
                checkOverlayStyle,
              ]}
              pointerEvents="none"
            >
              <Text style={styles.checkOverlayText}>✓</Text>
            </Animated.View>
          </View>
          <View style={styles.info}>
            <Text
              style={[styles.name, { color: colors.textPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
            {(showStage || showFlow) && (
              <Animated.Text
                key={`${stage.id}-${flow.currentFlowDays}`}
                entering={FadeInUp.duration(200)}
                exiting={FadeOutUp.duration(150)}
                style={[styles.flowText, { color }]}
              >
                {showStage && `${stage.emoji} ${stageLabel}`}
                {showStage && showFlow && '  ·  '}
                {showFlow && (flow.isBreathingToday
                  ? t('components.habitCard.flowBreathing', { days: flow.currentFlowDays })
                  : t('components.habitCard.flow', { days: flow.currentFlowDays }))}
              </Animated.Text>
            )}
          </View>
        </View>
        {reminderTime && (
          <View
            style={[styles.reminderChip, { backgroundColor: colors.surfaceLight }]}
          >
            <Text style={[styles.reminderChipText, { color: colors.textMuted }]}>
              ⏰ {reminderTime}
            </Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  icon: { fontSize: 24 },
  checkOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  checkOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  info: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  flowText: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  reminderChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  reminderChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
