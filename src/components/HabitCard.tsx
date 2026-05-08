import { useEffect } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  interpolate,
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
  completionIndex = 0,
  totalHabits = 1,
  onToggle,
  onEdit,
}: HabitCardProps) {
  const { t } = useTranslation();
  const colors = useThemeStore((s) => s.getColors());
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(completed ? 1 : 0);
  const fillProgress = useSharedValue(completed ? 1 : 0);
  const cardBg = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    if (completed) {
      checkScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      fillProgress.value = withTiming(1, { duration: 200 });
      cardBg.value = withTiming(1, { duration: 300 });
    } else {
      checkScale.value = withTiming(0, { duration: 100 });
      fillProgress.value = withTiming(0, { duration: 100 });
      cardBg.value = withTiming(0, { duration: 150 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  const handleToggle = () => {
    if (!completed) {
      scale.value = withSequence(
        withTiming(0.95, { duration: 80 }),
        withSpring(1, { damping: 10, stiffness: 300 })
      );
      if (completionIndex >= totalHabits - 1) {
        hapticNotification(NotificationFeedbackType.Success);
      } else if (completionIndex >= totalHabits - 2) {
        hapticImpact(ImpactFeedbackStyle.Heavy);
      } else {
        hapticImpact(ImpactFeedbackStyle.Medium);
      }
    } else {
      scale.value = withSequence(
        withTiming(0.98, { duration: 80 }),
        withTiming(1, { duration: 120 })
      );
      hapticImpact(ImpactFeedbackStyle.Light);
    }
    onToggle();
  };

  // Long-press to edit (shortcut)
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onBegin(() => {
      scale.value = withTiming(0.97, { duration: 200 });
    })
    .onEnd(() => {
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
      cardBg.value,
      [0, 1],
      [colors.surface, color + '10']
    ),
    borderColor: interpolateColor(
      cardBg.value,
      [0, 1],
      ['transparent', color + '40']
    ),
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const checkboxAnimStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      fillProgress.value,
      [0, 1],
      ['transparent', color]
    ),
    borderWidth: interpolate(fillProgress.value, [0, 1], [2, 0]),
    borderColor: interpolateColor(
      fillProgress.value,
      [0, 1],
      [colors.inactive, color]
    ),
  }));

  const iconBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      cardBg.value,
      [0, 1],
      [color + '20', color + '30']
    ),
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
          <Animated.View style={[styles.iconContainer, iconBgStyle]}>
            <Text style={styles.icon}>{icon}</Text>
          </Animated.View>
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
        <Animated.View style={[styles.checkbox, checkboxAnimStyle]}>
          <Animated.Text style={[styles.checkmark, checkAnimStyle]}>
            ✓
          </Animated.Text>
        </Animated.View>
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
    borderWidth: 1.5,
    borderColor: 'transparent',
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
  },
  icon: { fontSize: 24 },
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
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
