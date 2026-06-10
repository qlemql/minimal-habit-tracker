import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRewardStore } from '@/store/rewardStore';
import { useThemeStore } from '@/store/themeStore';
import { hapticImpact, ImpactFeedbackStyle } from '@/utils/haptics';
import { fontSize, spacing, UNLOCK_PACKS, PACK_IDS, PackId } from '@/constants/theme';
import { getDaysUntilNextMilestone } from '@/constants/rewards';

interface Props {
  maxFlowEver: number;
}

const PROXIMITY_THRESHOLD = 3; // D-3 이내일 때 표시

/**
 * 다음 마일스톤이 D-3 이내일 때 통계 화면에 노출되는 미리보기 카드.
 * 사용자가 4개 팩 중 받을 것을 미리 골라둘 수 있음.
 * 모든 팩 해금 완료 시엔 "🎉 모든 팩을 모았어요" 표시.
 */
export function UpcomingUnlockCard({ maxFlowEver }: Props) {
  const { t } = useTranslation();
  const colors = useThemeStore((s) => s.getColors());
  const unlockedPacks = useRewardStore((s) => s.unlockedPacks);
  const selectedUpcomingPack = useRewardStore((s) => s.selectedUpcomingPack);
  const chooseUpcomingPack = useRewardStore((s) => s.chooseUpcomingPack);

  const remaining = useMemo(
    () => PACK_IDS.filter((p) => !unlockedPacks.includes(p)),
    [unlockedPacks]
  );

  const next = useMemo(() => getDaysUntilNextMilestone(maxFlowEver), [maxFlowEver]);

  // 모두 해금 완료
  if (remaining.length === 0 || !next) {
    return (
      <View style={[styles.allDoneCard, { backgroundColor: colors.completionBg }]}>
        <Text style={[styles.allDoneText, { color: colors.completionBorder }]}>
          {t('upcoming.allDone')}
        </Text>
      </View>
    );
  }

  // D-3보다 멀면 표시 안 함
  if (next.daysLeft > PROXIMITY_THRESHOLD) return null;

  const handlePick = (id: PackId) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    // 이미 선택된 거 다시 누르면 해제
    chooseUpcomingPack(selectedUpcomingPack === id ? null : id);
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.completionBorder },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.completionBorder }]}>
          {t('upcoming.label', { days: next.daysLeft })}
        </Text>
        <View style={[styles.daysPill, { backgroundColor: colors.textPrimary }]}>
          <Text style={[styles.daysPillText, { color: colors.background }]}>
            D-{next.daysLeft}
          </Text>
        </View>
      </View>
      <Text style={[styles.desc, { color: colors.textSecondary }]}>
        {t('upcoming.desc')}
      </Text>

      <View style={styles.grid}>
        {remaining.map((id) => {
          const pack = UNLOCK_PACKS[id];
          const isSelected = selectedUpcomingPack === id;
          return (
            <Pressable
              key={id}
              onPress={() => handlePick(id)}
              style={({ pressed }) => [
                styles.packCell,
                { backgroundColor: colors.background, borderColor: 'transparent' },
                isSelected && {
                  backgroundColor: colors.completionBg,
                  borderColor: colors.completionBorder,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.packCellTop}>
                <Text style={styles.packEmoji}>{pack.emoji}</Text>
                <Text
                  style={[
                    styles.packLock,
                    { color: isSelected ? colors.completionBorder : colors.textMuted },
                  ]}
                >
                  {isSelected ? '✓' : '🔒'}
                </Text>
              </View>
              <Text style={[styles.packName, { color: colors.textPrimary }]} numberOfLines={1}>
                {t(`packs.${id}.name` as 'packs.health.name')}
              </Text>
              <View style={styles.packIconsRow}>
                {pack.icons.slice(0, 3).map((ic, i) => (
                  <Text key={i} style={[styles.packIconMini, { opacity: 0.7 }]}>
                    {ic}
                  </Text>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.footer, { color: colors.textMuted }]}>
        {selectedUpcomingPack
          ? t('upcoming.picked', {
              packName: t(`packs.${selectedUpcomingPack}.name` as 'packs.health.name'),
            })
          : t('upcoming.noneSelected')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  daysPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  daysPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  desc: {
    fontSize: fontSize.xs,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  packCell: {
    width: '47%',
    borderRadius: 12,
    padding: spacing.sm + 2,
    borderWidth: 1.5,
  },
  packCellTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  packEmoji: {
    fontSize: 22,
  },
  packLock: {
    fontSize: 12,
    fontWeight: '700',
  },
  packName: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginBottom: 4,
  },
  packIconsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  packIconMini: {
    fontSize: 12,
  },
  footer: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  // 모두 해금 완료
  allDoneCard: {
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  allDoneText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
