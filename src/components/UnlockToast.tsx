import { useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useRewardStore } from '@/store/rewardStore';
import { useThemeStore } from '@/store/themeStore';
import { hapticNotification, NotificationFeedbackType } from '@/utils/haptics';
import { fontSize, spacing, UNLOCK_PACKS } from '@/constants/theme';

export function UnlockToast() {
  const { t } = useTranslation();
  const pendingPackUnlock = useRewardStore((s) => s.pendingPackUnlock);
  const dismissPackUnlock = useRewardStore((s) => s.dismissPackUnlock);
  const colors = useThemeStore((s) => s.getColors());

  useEffect(() => {
    if (pendingPackUnlock) {
      hapticNotification(NotificationFeedbackType.Success);
    }
  }, [pendingPackUnlock]);

  const handleDismiss = useCallback(() => {
    dismissPackUnlock();
  }, [dismissPackUnlock]);

  useEffect(() => {
    if (!pendingPackUnlock) return;
    const timer = setTimeout(handleDismiss, 5000);
    return () => clearTimeout(timer);
  }, [pendingPackUnlock, handleDismiss]);

  if (!pendingPackUnlock) return null;

  const pack = UNLOCK_PACKS[pendingPackUnlock];
  const packName = t(`packs.${pendingPackUnlock}.name` as const);

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      exiting={FadeOutDown.duration(300)}
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.completionBorder },
      ]}
    >
      <Pressable onPress={handleDismiss} style={styles.inner}>
        <View style={styles.headerRow}>
          <View style={[styles.packBadge, { backgroundColor: colors.completionBg }]}>
            <Text style={styles.packEmoji}>{pack.emoji}</Text>
          </View>
          <View style={styles.textArea}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t('unlock.newPack', { packName })}
            </Text>
            <Text style={[styles.subtitle, { color: colors.completionBorder }]}>
              {t('packs.' + pendingPackUnlock + '.tag' as 'packs.health.tag')}
            </Text>
          </View>
        </View>

        <View style={styles.iconGrid}>
          {pack.icons.map((icon, i) => (
            <View key={`icon-${i}`} style={[styles.iconCell, { backgroundColor: colors.background }]}>
              <Text style={styles.iconText}>{icon}</Text>
            </View>
          ))}
        </View>

        <View style={styles.colorRow}>
          {pack.colors.map((color, i) => (
            <View
              key={`color-${i}`}
              style={[styles.colorBar, { backgroundColor: color }]}
            />
          ))}
        </View>

        <Text style={[styles.cta, { color: colors.textMuted }]}>{t('unlock.cta')}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inner: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginBottom: spacing.sm + 2,
  },
  packBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packEmoji: {
    fontSize: 28,
  },
  textArea: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 2,
  },
  iconGrid: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.sm,
  },
  iconCell: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.sm,
  },
  colorBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  cta: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
