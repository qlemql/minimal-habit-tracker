import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { hapticImpact, ImpactFeedbackStyle } from '@/utils/haptics';
import { useHabitStore } from '@/store/habitStore';
import { useCopy } from './preferences';
import { Button, Icon, palette, s, TextButton } from './ui';

interface HabitActionProps {
  habitId: string;
  completed: boolean;
  tiny: boolean;
}

export const HabitAction = ({ habitId, completed, tiny }: HabitActionProps) => {
  const c = useCopy();
  const reducedMotion = useReducedMotion();
  const previousCompleted = useRef(completed);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    if (previousCompleted.current === completed) return;
    previousCompleted.current = completed;
    cancelAnimation(scale);
    cancelAnimation(opacity);
    scale.value = 1;
    opacity.value = 1;
    if (reducedMotion) return;
    opacity.value = 0.82;
    opacity.value = withTiming(1, { duration: 140 });
    if (completed) {
      scale.value = withSequence(
        withTiming(1.08, { duration: 80 }),
        withTiming(1, { duration: 140 }),
      );
    }
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [completed, reducedMotion, scale, opacity]);

  const complete = (effort: 'full' | 'tiny') => {
    const store = useHabitStore.getState();
    // Feedback only for an accepted local action, never on mount or background sync.
    const before = store.logs;
    store.checkIn(habitId, effort);
    if (Platform.OS !== 'web' && useHabitStore.getState().logs !== before) {
      hapticImpact(ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Animated.View style={[s.gapSmall, contentStyle]}>
      {completed ? (
        <>
          <View style={styles.done} accessibilityLiveRegion="polite">
            <Animated.View style={iconStyle}>
              <Icon name="check" size={22} />
            </Animated.View>
            <Text style={styles.doneText}>{tiny ? c.tinyCompleted : c.completed}</Text>
          </View>
          <TextButton onPress={() => useHabitStore.getState().toggleHabit(habitId)}>
            {c.undo}
          </TextButton>
        </>
      ) : (
        <>
          <Button testID={`check-${habitId}`} onPress={() => complete('full')} icon="check">
            {c.done}
          </Button>
          <TextButton onPress={() => complete('tiny')}>{c.tiny}</TextButton>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  done: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: palette.pale,
    borderRadius: 12,
  },
  doneText: {
    color: palette.green,
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
});
