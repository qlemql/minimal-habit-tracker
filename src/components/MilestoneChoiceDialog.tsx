import { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRewardStore } from '@/store/rewardStore';
import { useThemeStore } from '@/store/themeStore';
import { hapticImpact, ImpactFeedbackStyle } from '@/utils/haptics';
import { fontSize, spacing, UNLOCK_PACKS, PACK_IDS, PackId } from '@/constants/theme';

/**
 * 마일스톤 도달 시 사용자가 미리 팩을 선택 안 했으면 표시되는 다이얼로그.
 * 4개 팩 중 아직 해금 안 된 것들 중 1개 선택 → 확정.
 * - selectable=false인 마지막 milestone은 자동 해제되므로 이 다이얼로그를 거치지 않음.
 */
export function MilestoneChoiceDialog() {
  const { t } = useTranslation();
  const pendingMilestoneChoice = useRewardStore((s) => s.pendingMilestoneChoice);
  const unlockedPacks = useRewardStore((s) => s.unlockedPacks);
  const confirmMilestoneChoice = useRewardStore((s) => s.confirmMilestoneChoice);
  const colors = useThemeStore((s) => s.getColors());
  const [selected, setSelected] = useState<PackId | null>(null);

  const remaining = useMemo(
    () => PACK_IDS.filter((p) => !unlockedPacks.includes(p)),
    [unlockedPacks]
  );

  if (!pendingMilestoneChoice) return null;

  const handleSelect = (id: PackId) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const handleConfirm = () => {
    if (!selected) return;
    hapticImpact(ImpactFeedbackStyle.Medium);
    confirmMilestoneChoice(selected);
    setSelected(null);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.background }]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t('milestoneChoice.title', { days: pendingMilestoneChoice })}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('milestoneChoice.subtitle')}
          </Text>

          <View style={styles.grid}>
            {remaining.map((id) => {
              const pack = UNLOCK_PACKS[id];
              const isSelected = selected === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => handleSelect(id)}
                  style={({ pressed }) => [
                    styles.packCard,
                    { backgroundColor: colors.surface, borderColor: 'transparent' },
                    isSelected && {
                      backgroundColor: colors.completionBg,
                      borderColor: colors.completionBorder,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.packEmoji}>{pack.emoji}</Text>
                  <Text style={[styles.packName, { color: colors.textPrimary }]}>
                    {t(`packs.${id}.name` as 'packs.health.name')}
                  </Text>
                  <Text style={[styles.packTag, { color: colors.textMuted }]} numberOfLines={1}>
                    {t(`packs.${id}.tag` as 'packs.health.tag')}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={handleConfirm}
            disabled={!selected}
            style={({ pressed }) => [
              styles.confirmButton,
              {
                backgroundColor: selected ? colors.completionBorder : colors.inactive,
              },
              pressed && selected && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.confirmText}>
              {selected
                ? t('milestoneChoice.cta', {
                    packName: t(`packs.${selected}.name` as 'packs.health.name'),
                  })
                : t('milestoneChoice.subtitle')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    padding: spacing.lg,
    alignItems: 'stretch',
  },
  emoji: {
    fontSize: 44,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  packCard: {
    width: '47.5%',
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  packEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  packName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  packTag: {
    fontSize: fontSize.xs - 1,
    marginTop: 2,
    textAlign: 'center',
  },
  confirmButton: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
