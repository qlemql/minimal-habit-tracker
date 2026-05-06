import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, AppState, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useHabitStore } from '@/store/habitStore';
import { HabitCard } from '@/components/HabitCard';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { CelebrationOverlay } from '@/components/CelebrationOverlay';
import { DayDetailSheet } from '@/components/DayDetailSheet';
import { calculateFlow } from '@/utils/streak';
import { getToday } from '@/utils/date';
import { useThemeStore } from '@/store/themeStore';
import { useRewardStore } from '@/store/rewardStore';
import { UnlockToast } from '@/components/UnlockToast';
import { syncWidgetData, processPendingWidgetToggles } from '@/utils/widgetData';
import { fontSize, spacing } from '@/constants/theme';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return '아직 새벽이에요';
  if (hour < 9) return '좋은 아침이에요';
  if (hour < 12) return '오전도 화이팅';
  if (hour < 14) return '점심 잘 챙겨요';
  if (hour < 18) return '오후도 힘내요';
  if (hour < 21) return '저녁이에요';
  return '오늘 하루도 수고했어요';
}

export default function HomeScreen() {
  const router = useRouter();
  const { habits, logs, toggleHabit, isHabitCompleted, canAddHabit } =
    useHabitStore();
  const colors = useThemeStore((s) => s.getColors());
  const [today, setToday] = useState(getToday());
  const greeting = useMemo(() => getGreeting(), [today]);

  useEffect(() => {
    // 첫 마운트 시에도 위젯 큐 처리 (콜드 스타트)
    processPendingWidgetToggles();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setToday(getToday());
        processPendingWidgetToggles().then(() => syncWidgetData());
      }
    });
    return () => sub.remove();
  }, []);

  const activeHabits = useMemo(
    () => [...habits].sort((a, b) => a.order - b.order),
    [habits]
  );

  const allCompleted =
    activeHabits.length > 0 &&
    activeHabits.every((h) => isHabitCompleted(h.id, today));

  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const completedCount = activeHabits.filter((h) => isHabitCompleted(h.id, today)).length;
  const totalCount = activeHabits.length;
  const prevCompletedCount = useRef(completedCount);

  // Animated progress bar (pixel-based for Reanimated compatibility)
  const [barWidth, setBarWidth] = useState(0);
  const progressWidth = useSharedValue(0);
  const barColorProgress = useSharedValue(0);

  const onBarLayout = useCallback((e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  }, []);

  useEffect(() => {
    const target = totalCount > 0 ? (completedCount / totalCount) * barWidth : 0;
    progressWidth.value = withTiming(target, { duration: 400 });
  }, [completedCount, totalCount, barWidth, progressWidth]);

  useEffect(() => {
    barColorProgress.value = withTiming(allCompleted ? 1 : 0, { duration: 400 });
  }, [allCompleted, barColorProgress]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
    backgroundColor: interpolateColor(
      barColorProgress.value,
      [0, 1],
      [colors.accent, colors.success]
    ),
  }));

  useEffect(() => {
    if (totalCount > 0 && completedCount === totalCount && prevCompletedCount.current === totalCount - 1) {
      setShowCelebration(true);
    }
    prevCompletedCount.current = completedCount;
    syncWidgetData();
  }, [completedCount, totalCount]);

  // Flow 결과 메모이제이션 (렌더당 1회만 계산)
  const flowResults = useMemo(() => {
    const map = new Map<string, import('@/utils/streak').FlowResult>();
    activeHabits.forEach((h) => {
      map.set(h.id, calculateFlow(h.id, logs, today));
    });
    return map;
  }, [activeHabits, logs, today]);

  const hasBreathingHabit = useMemo(
    () => Array.from(flowResults.values()).some((f) => f.isBreathingToday),
    [flowResults]
  );

  // 해금 체크: 모든 습관 중 최대 흐름 일수 기준
  const checkUnlocks = useRewardStore((s) => s.checkUnlocks);
  const currentMaxFlow = useMemo(() => {
    if (flowResults.size === 0) return 0;
    return Math.max(...Array.from(flowResults.values()).map((f) => f.longestFlow));
  }, [flowResults]);
  useEffect(() => {
    if (currentMaxFlow > 0) checkUnlocks(currentMaxFlow);
  }, [currentMaxFlow, checkUnlocks]);

  const handleCloseCelebration = useCallback(() => setShowCelebration(false), []);
  const handleCloseDetail = useCallback(() => setSelectedDate(null), []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
            <Text style={[styles.dateText, { color: colors.textPrimary }]}>
              {new Date(today + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={12}
            accessibilityLabel="설정"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.settingsButton,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            ]}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>
        {totalCount > 0 && (
          <View style={styles.progressRow}>
            <View
              style={[styles.progressBarBg, { backgroundColor: colors.inactive }]}
              onLayout={onBarLayout}
            >
              <Animated.View
                style={[
                  styles.progressBarFill,
                  progressBarStyle,
                ]}
              />
            </View>
            <Text style={[styles.progress, { color: allCompleted ? colors.success : colors.textSecondary }]}>
              {allCompleted ? '모두 완료! 🎉' : `${completedCount}/${totalCount}`}
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeHabits.length > 0 && hasBreathingHabit && (
          <Animated.View entering={FadeInDown.duration(400)} style={[styles.breathingBanner, { backgroundColor: colors.surface }]}>
            <Text style={[styles.breathingText, { color: colors.textSecondary }]}>
              쉬어가는 중이에요, 오늘 다시 이어가요
            </Text>
          </Animated.View>
        )}
        {activeHabits.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface }]}>
              <Text style={styles.emptyIcon}>✨</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>아직 습관이 없어요</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              작은 시작이 큰 변화를 만들어요
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.habitList}>
            {activeHabits.map((habit, index) => (
              <Animated.View key={habit.id} entering={FadeInDown.delay(index * 60).duration(400)}>
                <HabitCard
                  name={habit.name}
                  icon={habit.icon}
                  color={habit.color}
                  completed={isHabitCompleted(habit.id, today)}
                  flow={flowResults.get(habit.id) ?? { currentFlowDays: 0, currentFlowStartDate: today, isBreathingToday: false, longestFlow: 0, status: 'new' as const }}
                  completionIndex={completedCount}
                  totalHabits={totalCount}
                  onToggle={() => toggleHabit(habit.id)}
                  onEdit={() =>
                    router.push({ pathname: '/edit', params: { id: habit.id } })
                  }
                />
              </Animated.View>
            ))}
            <View style={{ marginTop: spacing.xs }}>
              <WeeklyCalendar onDatePress={setSelectedDate} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {canAddHabit() ? (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
            ]}
            onPress={() => router.push('/add')}
          >
            <Text style={[styles.addIcon, { color: colors.accent }]}>+</Text>
            <Text style={[styles.addButtonText, { color: colors.textSecondary }]}>습관 추가</Text>
          </Pressable>
        ) : totalCount > 0 ? (
          <View style={styles.maxHintContainer}>
            <Text style={[styles.maxHint, { color: colors.textMuted }]}>
              3개면 충분해요
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
      <DayDetailSheet date={selectedDate} onClose={handleCloseDetail} />
      <CelebrationOverlay
        visible={showCelebration}
        currentMaxFlow={currentMaxFlow}
        onDone={handleCloseCelebration}
      />
      <UnlockToast />
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  greeting: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progress: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  habitList: {
    gap: spacing.sm + 2,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    fontSize: 36,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButtonText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  maxHintContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  maxHint: {
    fontSize: fontSize.xs,
  },
  breathingBanner: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm + 2,
    alignItems: 'center',
  },
  breathingText: {
    fontSize: fontSize.sm,
  },
});
