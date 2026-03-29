import { View, Text, StyleSheet } from 'react-native';
import { useHabitStore } from '@/store/habitStore';
import { getWeekDates, getToday, DAY_LABELS } from '@/utils/date';
import { colors, fontSize, spacing } from '@/constants/theme';

export function WeeklyCalendar() {
  const { habits, isHabitCompleted } = useHabitStore();
  const activeHabits = habits;
  const weekDates = getWeekDates();
  const today = getToday();

  if (activeHabits.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>이번 주</Text>
      <View style={styles.grid}>
        {weekDates.map((date, index) => {
          const isToday = date === today;
          const completedCount = activeHabits.filter((h) =>
            isHabitCompleted(h.id, date)
          ).length;
          const allDone = completedCount === activeHabits.length && completedCount > 0;

          return (
            <View key={date} style={styles.dayColumn}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {DAY_LABELS[index]}
              </Text>
              <View
                style={[
                  styles.dayCircle,
                  isToday && styles.dayCircleToday,
                  allDone && styles.dayCircleDone,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isToday && styles.dayNumberToday,
                    allDone && styles.dayNumberDone,
                  ]}
                >
                  {parseInt(date.split('-')[2], 10)}
                </Text>
              </View>
              {/* 습관별 달성 점 */}
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
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  dayLabelToday: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleToday: {
    backgroundColor: colors.surfaceLight,
  },
  dayCircleDone: {
    backgroundColor: colors.success,
  },
  dayNumber: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  dayNumberToday: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dayNumberDone: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
    marginTop: spacing.xs,
    height: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
