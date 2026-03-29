import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useEffect } from 'react';
import { useHabitStore } from '@/store/habitStore';
import { useThemeStore } from '@/store/themeStore';
import { useProStore } from '@/store/proStore';
import { calculateStreak } from '@/utils/streak';
import { formatDate } from '@/utils/date';
import { fontSize, spacing } from '@/constants/theme';

export default function StatsScreen() {
  const router = useRouter();
  const colors = useThemeStore((s) => s.getColors());
  const isPro = useProStore((s) => s.isPro);
  const { habits, logs } = useHabitStore();

  useEffect(() => {
    if (!isPro) router.replace('/settings');
  }, [isPro]);

  // 전체 통계 계산
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const getMonthlyRate = (habitId: string) => {
    let total = 0;
    let completed = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDate(d);
      total++;
      if (logs.some((l) => l.habitId === habitId && l.date === dateStr && l.completed)) {
        completed++;
      }
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getLongestStreak = (habitId: string) => {
    const completedDates = logs
      .filter((l) => l.habitId === habitId && l.completed)
      .map((l) => l.date)
      .sort();

    if (completedDates.length === 0) return 0;

    let longest = 1;
    let current = 1;

    for (let i = 1; i < completedDates.length; i++) {
      const prev = new Date(completedDates[i - 1]);
      const curr = new Date(completedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return longest;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.textSecondary }]}>← 뒤로</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>통계</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            등록된 습관이 없습니다
          </Text>
        ) : (
          habits.map((habit) => {
            const streak = calculateStreak(habit.id, logs);
            const monthlyRate = getMonthlyRate(habit.id);
            const longestStreak = getLongestStreak(habit.id);

            return (
              <View
                key={habit.id}
                style={[styles.card, { backgroundColor: colors.surface }]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{habit.icon}</Text>
                  <Text style={[styles.cardName, { color: colors.textPrimary }]}>
                    {habit.name}
                  </Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: habit.color }]}>
                      {streak}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      현재 스트릭
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: habit.color }]}>
                      {longestStreak}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      최장 스트릭
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: habit.color }]}>
                      {monthlyRate}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      30일 달성률
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: {
    fontSize: fontSize.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  empty: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  card: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  cardName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
