import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useHabitStore } from '@/store/habitStore';
import { useThemeStore } from '@/store/themeStore';
import { getWeekDates, getToday, DAY_LABELS } from '@/utils/date';
import { fontSize, spacing } from '@/constants/theme';

interface WeeklyCalendarProps {
  onDatePress?: (date: string) => void;
}

export function WeeklyCalendar({ onDatePress }: WeeklyCalendarProps) {
  const { habits, isHabitCompleted } = useHabitStore();
  const colors = useThemeStore((s) => s.getColors());
  const activeHabits = habits;
  const weekDates = getWeekDates();
  const today = getToday();

  if (activeHabits.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>이번 주</Text>
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
              onPress={() => !isFuture && onDatePress?.(date)}
              disabled={isFuture}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md },
  title: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.md },
  grid: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 16, padding: spacing.md },
  dayColumn: { alignItems: 'center', flex: 1 },
  dayLabel: { fontSize: fontSize.xs, marginBottom: spacing.xs },
  dayCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  dayNumber: { fontSize: fontSize.sm },
  dots: { flexDirection: 'row', gap: 3, marginTop: spacing.xs, height: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
