import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { HabitCard } from '@/components/HabitCard';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { CelebrationOverlay } from '@/components/CelebrationOverlay';
import { DayDetailSheet } from '@/components/DayDetailSheet';
import { calculateStreak } from '@/utils/streak';
import { getToday } from '@/utils/date';
import { useThemeStore } from '@/store/themeStore';
import { fontSize, spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { habits, logs, toggleHabit, isHabitCompleted, canAddHabit } =
    useHabitStore();
  const colors = useThemeStore((s) => s.getColors());
  const today = getToday();
  const activeHabits = habits
    .sort((a, b) => a.order - b.order);

  const allCompleted =
    activeHabits.length > 0 &&
    activeHabits.every((h) => isHabitCompleted(h.id, today));

  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const prevAllCompleted = useRef(false);

  useEffect(() => {
    if (allCompleted && !prevAllCompleted.current) {
      setShowCelebration(true);
    }
    prevAllCompleted.current = allCompleted;
  }, [allCompleted]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CelebrationOverlay
        visible={showCelebration}
        onDone={() => setShowCelebration(false)}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>오늘의 습관</Text>
          <Pressable onPress={() => router.push('/settings')}>
            <Text style={[styles.settingsIcon, { color: colors.textMuted }]}>⚙</Text>
          </Pressable>
        </View>
        {allCompleted && activeHabits.length > 0 && (
          <Text style={[styles.allDone, { color: colors.success }]}>모두 완료! 🎉</Text>
        )}
      </View>

      <View style={styles.content}>
        {activeHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>습관을 추가해보세요</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
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
            <WeeklyCalendar onDatePress={setSelectedDate} />
          </View>
        )}
      </View>

      {canAddHabit() && (
        <View style={styles.footer}>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.surface, borderColor: colors.surfaceLight }]}
            onPress={() => router.push('/add')}
          >
            <Text style={[styles.addButtonText, { color: colors.textSecondary }]}>+ 습관 추가</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
      <DayDetailSheet date={selectedDate} onClose={() => setSelectedDate(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 22,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  allDone: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  habitList: {
    gap: spacing.sm,
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
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  addButton: {
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});
