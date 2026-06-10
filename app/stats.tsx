import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { hapticImpact, ImpactFeedbackStyle } from '@/utils/haptics';
import { useThemeStore } from '@/store/themeStore';
import { useHabitStore } from '@/store/habitStore';
import { useRewardStore } from '@/store/rewardStore';
import { calculateFlow } from '@/utils/streak';
import { UNLOCK_MILESTONES } from '@/constants/rewards';
import { UpcomingUnlockCard } from '@/components/UpcomingUnlockCard';
import { GROWTH_STAGES, GrowthStageId } from '@/constants/growth';
import { fontSize, spacing } from '@/constants/theme';

function stageEmoji(stage: GrowthStageId | undefined): string {
  if (!stage) return '🌱';
  const found = GROWTH_STAGES.find((s) => s.id === stage);
  return found?.emoji ?? '🌱';
}

export default function StatsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colors = useThemeStore((s) => s.getColors());
  const { habits, logs } = useHabitStore();
  const maxFlowEver = useRewardStore((s) => s.maxFlowEver);
  const unlockedPacks = useRewardStore((s) => s.unlockedPacks);

  const activeHabits = useMemo(() => habits.filter((h) => !h.isGraduated), [habits]);
  const graduatedHabits = useMemo(
    () =>
      habits
        .filter((h) => h.isGraduated)
        .sort((a, b) => (b.graduatedAt ?? '').localeCompare(a.graduatedAt ?? '')),
    [habits]
  );

  const totalDone = logs.filter((l) => l.completed).length;
  const unlockedCount = unlockedPacks.length;
  const dateLocale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';

  // 활성 습관의 현재 최장 흐름 (이미 완료된 습관 제외, 졸업 시점에 정확한 값이 totalFlowDays로 보존됨)
  const currentMaxFlow = useMemo(() => {
    if (activeHabits.length === 0) return maxFlowEver;
    const flows = activeHabits.map((h) => calculateFlow(h.id, logs).currentFlowDays);
    return Math.max(maxFlowEver, ...flows);
  }, [activeHabits, logs, maxFlowEver]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            hapticImpact(ImpactFeedbackStyle.Light);
            router.back();
          }}
          hitSlop={12}
          accessibilityLabel={t('settings.a11y.back')}
          accessibilityRole="button"
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.backIcon, { color: colors.textSecondary }]}>‹</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('stats.title')}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView overScrollMode="never" style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 기본 통계 (2x2 그리드) */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.accent }]}>{activeHabits.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t('stats.basic.activeHabits')}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.surfaceLight }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.accent }]}>{totalDone}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t('stats.basic.totalDone')}
              </Text>
            </View>
          </View>
          <View style={[styles.statsRowDivider, { backgroundColor: colors.surfaceLight }]} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.accent }]}>{currentMaxFlow}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t('stats.basic.maxFlow')}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.surfaceLight }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.accent }]}>{unlockedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t('stats.basic.unlocks')}
              </Text>
            </View>
          </View>
        </View>

        {/* 다음 해금 — D-3 이내 또는 모두 해금 시 표시 */}
        <UpcomingUnlockCard maxFlowEver={currentMaxFlow} />

        {/* 졸업한 정원 */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('stats.garden.title')}
        </Text>

        {graduatedHabits.length === 0 ? (
          <View style={[styles.emptyGarden, { backgroundColor: colors.surface }]}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {t('stats.garden.empty')}
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
              {t('stats.garden.emptyHint')}
            </Text>
          </View>
        ) : (
          <View style={styles.gardenList}>
            {graduatedHabits.map((h) => {
              const date = h.graduatedAt
                ? new Date(h.graduatedAt + 'T00:00:00').toLocaleDateString(dateLocale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '';
              const stageKey: GrowthStageId = h.graduatedStage ?? 'leaf';
              return (
                <View
                  key={h.id}
                  style={[styles.gardenItem, { backgroundColor: colors.surface }]}
                >
                  <View style={[styles.gardenIcon, { backgroundColor: h.color + '20' }]}>
                    <Text style={styles.gardenIconText}>{h.icon}</Text>
                  </View>
                  <View style={styles.gardenInfo}>
                    <Text
                      style={[styles.gardenName, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {h.name}
                    </Text>
                    <Text style={[styles.gardenMeta, { color: colors.textSecondary }]}>
                      {stageEmoji(stageKey)} {t(`graduation.stage.${stageKey}`)}
                    </Text>
                    <Text style={[styles.gardenMeta, { color: colors.textMuted }]}>
                      {t('stats.garden.totalDays', { days: h.totalFlowDays ?? 0 })}
                      {date ? ` · ${t('stats.garden.graduatedOn', { date })}` : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 22, fontWeight: '600', marginTop: -2 },
  headerTitle: { fontSize: fontSize.md, fontWeight: '600' },

  content: { flex: 1, paddingHorizontal: spacing.lg },

  statsCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: fontSize.xs, marginTop: 2 },
  statDivider: { width: 1, marginVertical: 4 },
  statsRowDivider: { height: 1, marginVertical: spacing.md },

  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },

  emptyGarden: {
    borderRadius: 16,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.xs },
  emptyHint: { fontSize: fontSize.sm, textAlign: 'center' },

  gardenList: { gap: spacing.sm },
  gardenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.md,
  },
  gardenIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gardenIconText: { fontSize: 24 },
  gardenInfo: { flex: 1, gap: 2 },
  gardenName: { fontSize: fontSize.md, fontWeight: '600' },
  gardenMeta: { fontSize: fontSize.xs, fontWeight: '500' },
});
