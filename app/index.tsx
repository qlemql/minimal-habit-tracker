import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { HabitCard } from '@/components/HabitCard';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { calculateStreak } from '@/utils/streak';
import { getToday } from '@/utils/date';
import { colors, fontSize, spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { habits, logs, toggleHabit, isHabitCompleted, canAddHabit } =
    useHabitStore();
  const today = getToday();
  const activeHabits = habits
    .sort((a, b) => a.order - b.order);

  const allCompleted =
    activeHabits.length > 0 &&
    activeHabits.every((h) => isHabitCompleted(h.id, today));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>오늘의 습관</Text>
        {allCompleted && activeHabits.length > 0 && (
          <Text style={styles.allDone}>모두 완료! 🎉</Text>
        )}
      </View>

      <View style={styles.content}>
        {activeHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>습관을 추가해보세요</Text>
            <Text style={styles.emptySubtitle}>
              딱 3개만 골라서 집중하세요
            </Text>
          </View>
        ) : (
          <View style={styles.habitList}>
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                name={habit.name}
                icon={habit.icon}
                color={habit.color}
                completed={isHabitCompleted(habit.id, today)}
                streak={calculateStreak(habit.id, logs)}
                onToggle={() => toggleHabit(habit.id)}
                onEdit={() =>
                  router.push({ pathname: '/edit', params: { id: habit.id } })
                }
              />
            ))}
            <WeeklyCalendar />
          </View>
        )}
      </View>

      {canAddHabit() && (
        <View style={styles.footer}>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/add')}
          >
            <Text style={styles.addButtonText}>+ 습관 추가</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  allDone: {
    fontSize: fontSize.sm,
    color: colors.success,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  habitList: {
    gap: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
