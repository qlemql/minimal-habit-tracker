import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useHabitStore } from '@/store/habitStore';
import { useThemeStore } from '@/store/themeStore';
import { getWeekDates, getToday, formatDate, DAY_LABELS } from '@/utils/date';
import { fontSize, spacing } from '@/constants/theme';

interface WeeklyCalendarProps {
  onDatePress?: (date: string) => void;
}

export function WeeklyCalendar({ onDatePress }: WeeklyCalendarProps) {
  const { habits, isHabitCompleted } = useHabitStore();
  const colors = useThemeStore((s) => s.getColors());
  const activeHabits = habits;
  const today = getToday();

  // 주 오프셋: 0=이번주, -1=지난주, -2=2주전...
  const [weekOffset, setWeekOffset] = useState(0);

  const getBaseDate = useCallback(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = getWeekDates(getBaseDate());
  const isCurrentWeek = weekOffset === 0;

  // 주 라벨 (예: "3월 24일 ~ 30일")
  const firstDate = new Date(weekDates[0] + 'T00:00:00');
  const lastDate = new Date(weekDates[6] + 'T00:00:00');
  const firstMonth = firstDate.getMonth() + 1;
  const lastMonth = lastDate.getMonth() + 1;
  const weekLabel = isCurrentWeek
    ? '이번 주'
    : firstMonth === lastMonth
      ? `${firstMonth}월 ${firstDate.getDate()}일 ~ ${lastDate.getDate()}일`
      : `${firstMonth}월 ${firstDate.getDate()}일 ~ ${lastMonth}월 ${lastDate.getDate()}일`;

  // 스와이프 제스처
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .onEnd((e) => {
      if (e.translationX > 50) {
        // 오른쪽 스와이프 → 이전 주
        setWeekOffset((prev) => prev - 1);
      } else if (e.translationX < -50 && weekOffset < 0) {
        // 왼쪽 스와이프 → 다음 주 (미래는 이번주까지만)
        setWeekOffset((prev) => prev + 1);
      }
    });

  if (activeHabits.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setWeekOffset((p) => p - 1)}
          hitSlop={12}
          accessibilityLabel="이전 주"
          accessibilityRole="button"
        >
          <Text style={[styles.arrow, { color: colors.textMuted }]}>‹</Text>
        </Pressable>
        <Pressable
          onPress={() => isCurrentWeek || setWeekOffset(0)}
          accessibilityLabel={weekLabel}
        >
          <Text style={[styles.title, { color: colors.textSecondary }]}>{weekLabel}</Text>
        </Pressable>
        <Pressable
          onPress={() => weekOffset < 0 && setWeekOffset((p) => p + 1)}
          hitSlop={12}
          accessibilityLabel="다음 주"
          accessibilityRole="button"
          disabled={isCurrentWeek}
        >
          <Text style={[styles.arrow, { color: colors.textMuted }, isCurrentWeek && { opacity: 0.2 }]}>›</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={swipeGesture}>
        <View style={[styles.grid, { backgroundColor: colors.surface }]}>
          {weekDates.map((date, index) => {
            const isToday = date === today;
            const isFuture = date > today;
            const completedCount = activeHabits.filter((h) =>
              isHabitCompleted(h.id, date)
            ).length;
            const allDone = completedCount === activeHabits.length && completedCount > 0;

            return (
              <Pressable
                key={date}
                style={styles.dayColumn}
                onPress={() => !isFuture && isCurrentWeek && onDatePress?.(date)}
                disabled={isFuture || !isCurrentWeek}
                accessibilityLabel={`${DAY_LABELS[index]}요일 ${parseInt(date.split('-')[2], 10)}일${allDone ? ' 모두 완료' : ''}`}
                accessibilityRole="button"
              >
                <Text style={[styles.dayLabel, { color: colors.textMuted }, isToday && { color: colors.textPrimary, fontWeight: '600' }]}>
                  {DAY_LABELS[index]}
                </Text>
                <View
                  style={[
                    styles.dayCircle,
                    isToday && { backgroundColor: colors.surfaceLight },
                    allDone && { backgroundColor: colors.success },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: colors.textSecondary },
                      isToday && { color: colors.textPrimary, fontWeight: '600' },
                      allDone && { color: '#FFFFFF', fontWeight: '600' },
                      isFuture && { opacity: 0.3 },
                    ]}
                  >
                    {parseInt(date.split('-')[2], 10)}
                  </Text>
                </View>
                <View style={styles.dots}>
                  {activeHabits.map((habit) => (
                    <View
                      key={habit.id}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: isHabitCompleted(habit.id, date)
                            ? habit.color
                            : colors.inactive,
                        },
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  arrow: { fontSize: 24, fontWeight: '600', paddingHorizontal: spacing.sm },
  title: { fontSize: fontSize.sm, fontWeight: '500' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 16, padding: spacing.md },
  dayColumn: { alignItems: 'center', flex: 1 },
  dayLabel: { fontSize: fontSize.xs, marginBottom: spacing.xs },
  dayCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  dayNumber: { fontSize: fontSize.sm },
  dots: { flexDirection: 'row', gap: 3, marginTop: spacing.xs, height: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
