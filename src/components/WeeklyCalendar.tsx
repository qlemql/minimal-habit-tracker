import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { useHabitStore } from '@/store/habitStore';
import { useThemeStore } from '@/store/themeStore';
import { getWeekDates, getToday, DAY_LABELS } from '@/utils/date';
import { fontSize, spacing } from '@/constants/theme';

function AnimatedDot({ completed, color, inactiveColor }: { completed: boolean; color: string; inactiveColor: string }) {
  const progress = useSharedValue(completed ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(completed ? 1 : 0, { duration: 300 });
  }, [completed, progress]);
  const dotStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [inactiveColor, color]),
  }));
  return <Animated.View style={[styles.dot, dotStyle]} />;
}

interface WeeklyCalendarProps {
  onDatePress?: (date: string) => void;
}

export function WeeklyCalendar({ onDatePress }: WeeklyCalendarProps) {
  const { habits, isHabitCompleted } = useHabitStore();
  const colors = useThemeStore((s) => s.getColors());
  const activeHabits = habits;
  const today = getToday();

  const [weekOffset, setWeekOffset] = useState(0);
  const translateX = useSharedValue(0);

  const weekDates = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return getWeekDates(d);
  }, [weekOffset]);
  const isCurrentWeek = weekOffset === 0;

  const firstDate = new Date(weekDates[0] + 'T00:00:00');
  const lastDate = new Date(weekDates[6] + 'T00:00:00');
  const firstMonth = firstDate.getMonth() + 1;
  const lastMonth = lastDate.getMonth() + 1;
  const weekLabel = isCurrentWeek
    ? '이번 주'
    : firstMonth === lastMonth
      ? `${firstMonth}월 ${firstDate.getDate()}일 ~ ${lastDate.getDate()}일`
      : `${firstMonth}월 ${firstDate.getDate()}일 ~ ${lastMonth}월 ${lastDate.getDate()}일`;

  const goToPrevWeek = useCallback(() => {
    setWeekOffset((prev) => prev - 1);
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekOffset((prev) => prev + 1);
  }, []);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.3;
    })
    .onEnd((e) => {
      translateX.value = withTiming(0, { duration: 200 });
      if (e.translationX > 50) {
        runOnJS(goToPrevWeek)();
      } else if (e.translationX < -50 && weekOffset < 0) {
        runOnJS(goToNextWeek)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (activeHabits.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: 16 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setWeekOffset((p) => p - 1)}
          hitSlop={12}
          style={[styles.arrowButton, { backgroundColor: colors.surfaceLight }]}
          accessibilityLabel="이전 주"
          accessibilityRole="button"
        >
          <Text style={[styles.arrow, { color: colors.textSecondary }]}>‹</Text>
        </Pressable>
        <Pressable
          onPress={() => isCurrentWeek || setWeekOffset(0)}
          accessibilityLabel={weekLabel}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>{weekLabel}</Text>
        </Pressable>
        <Pressable
          onPress={() => weekOffset < 0 && setWeekOffset((p) => p + 1)}
          hitSlop={12}
          style={[styles.arrowButton, { backgroundColor: colors.surfaceLight }, isCurrentWeek && { opacity: 0.3 }]}
          accessibilityLabel="다음 주"
          accessibilityRole="button"
          disabled={isCurrentWeek}
        >
          <Text style={[styles.arrow, { color: colors.textSecondary }]}>›</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.grid, animatedStyle]}>
          {weekDates.map((date, index) => {
            const isToday = date === today;
            const isFuture = date > today;
            const completedCount = activeHabits.filter((h) =>
              isHabitCompleted(h.id, date)
            ).length;
            const allDone = completedCount === activeHabits.length && completedCount > 0;
            // 쉼표: 완료 0건이고 과거인데, 전날 또는 다음날에 완료 기록이 있는 경우 (단일 갭)
            const prevDate = index > 0 ? weekDates[index - 1] : null;
            const nextDate = index < 6 ? weekDates[index + 1] : null;
            const prevHasCompletion = prevDate ? activeHabits.some((h) => isHabitCompleted(h.id, prevDate)) : false;
            const nextHasCompletion = nextDate && nextDate <= today ? activeHabits.some((h) => isHabitCompleted(h.id, nextDate)) : false;
            const isBreathing = !isFuture && !isToday && completedCount === 0 && date < today && (prevHasCompletion || nextHasCompletion);

            return (
              <Pressable
                key={date}
                style={styles.dayColumn}
                onPress={() => !isFuture && onDatePress?.(date)}
                disabled={isFuture}
                accessibilityLabel={`${DAY_LABELS[index]}요일 ${parseInt(date.split('-')[2], 10)}일${allDone ? ' 모두 완료' : ''}`}
                accessibilityRole="button"
              >
                <Text style={[styles.dayLabel, { color: colors.textMuted }, isToday && { color: colors.accent, fontWeight: '700' }]}>
                  {DAY_LABELS[index]}
                </Text>
                <View
                  style={[
                    styles.dayCircle,
                    { backgroundColor: 'transparent' },
                    isToday && { backgroundColor: colors.accent + '20' },
                    allDone && { backgroundColor: colors.success },
                    isBreathing && { borderWidth: 1.5, borderColor: colors.inactive, borderStyle: 'dashed' },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: colors.textSecondary },
                      isToday && { color: colors.accent, fontWeight: '700' },
                      allDone && { color: '#FFFFFF', fontWeight: '700' },
                      isFuture && { opacity: 0.3 },
                      isBreathing && { color: colors.textMuted },
                    ]}
                  >
                    {parseInt(date.split('-')[2], 10)}
                  </Text>
                </View>
                <View style={styles.dots}>
                  {activeHabits.map((habit) => (
                    <AnimatedDot
                      key={habit.id}
                      completed={isHabitCompleted(habit.id, date)}
                      color={habit.color}
                      inactiveColor={colors.inactive}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: { fontSize: 20, fontWeight: '600' },
  title: { fontSize: fontSize.sm, fontWeight: '600' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  dayColumn: { alignItems: 'center', flex: 1 },
  dayLabel: { fontSize: 11, marginBottom: spacing.xs, fontWeight: '500' },
  dayCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dayNumber: { fontSize: fontSize.sm, fontWeight: '500' },
  dots: { flexDirection: 'row', gap: 3, marginTop: spacing.xs + 1, height: 8 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});
