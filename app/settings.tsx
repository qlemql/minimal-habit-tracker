import { View, Text, Pressable, StyleSheet, Linking, Alert, Switch, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { hapticImpact, ImpactFeedbackStyle } from '@/utils/haptics';
import { useThemeStore } from '@/store/themeStore';
import { useHabitStore } from '@/store/habitStore';
import { useRewardStore } from '@/store/rewardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { rescheduleAllReminders } from '@/utils/notifications';
import { REWARD_TIERS } from '@/constants/rewards';
import { fontSize, spacing } from '@/constants/theme';

const FEEDBACK_EMAIL = 'taehyun_fe@naver.com';
const LEGAL_BASE_URL = 'https://ssak-habit-tracker.pages.dev';
const APP_VERSION = '1.1.1';

// 디바이스 언어가 영어 계열이면 .en.html, 그 외(ko 등)는 한국어 원본 사용
function getLegalUrl(lang: string, page: 'privacy-policy' | 'terms-of-service'): string {
  const isEnglish = lang.toLowerCase().startsWith('en');
  const suffix = isEnglish ? '.en.html' : '.html';
  return `${LEGAL_BASE_URL}/${page}${suffix}`;
}

type ThemeOption = 'dark' | 'cream';

const THEME_OPTIONS: { value: ThemeOption; icon: string }[] = [
  { value: 'cream', icon: '🌿' },
  { value: 'dark', icon: '🌙' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colors = useThemeStore((s) => s.getColors());
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const { habits, logs } = useHabitStore();
  const activeHabits = habits.filter((h) => !h.isGraduated);
  const totalLogs = logs.filter((l) => l.completed).length;
  const maxFlowEver = useRewardStore((s) => s.maxFlowEver);
  const nextTier = REWARD_TIERS.find((t) => t.flowDays > maxFlowEver);
  const unlockedCount = REWARD_TIERS.filter((t) => t.flowDays <= maxFlowEver).length;
  const lockScreenActionEnabled = useSettingsStore((s) => s.lockScreenActionEnabled);
  const setLockScreenActionEnabled = useSettingsStore((s) => s.setLockScreenActionEnabled);

  const handleToggleLockScreenAction = async (value: boolean) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    setLockScreenActionEnabled(value);
    // 기존 예약 알림에 categoryIdentifier 적용/해제 위해 재등록
    try {
      await rescheduleAllReminders();
    } catch {
      // 실패해도 토글 상태는 유지 — 다음 알림 등록 시 자동 반영됨
    }
  };

  const handleFeedback = async () => {
    const canOpen = await Linking.canOpenURL(`mailto:${FEEDBACK_EMAIL}`);
    if (canOpen) {
      const subject = encodeURIComponent(t('settings.general.feedback.emailSubject'));
      Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}`);
    } else {
      await Clipboard.setStringAsync(FEEDBACK_EMAIL);
      Alert.alert(
        t('settings.general.feedback.copiedTitle'),
        t('settings.general.feedback.copiedBody', { email: FEEDBACK_EMAIL })
      );
    }
  };

  const handleGuide = () => {
    router.push({ pathname: '/onboarding', params: { guideOnly: '1' } });
  };

  const handleOpenUrl = async (url: string) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert(t('settings.general.linkError.title'), t('settings.general.linkError.body'));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => { hapticImpact(ImpactFeedbackStyle.Light); router.back(); }}
          hitSlop={12}
          accessibilityLabel={t('settings.a11y.back')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.surface },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={[styles.backIcon, { color: colors.textSecondary }]}>‹</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('settings.title')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{activeHabits.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('settings.stats.habits')}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.surfaceLight }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{totalLogs}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('settings.stats.totalDone')}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.surfaceLight }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#DA77F2' }]}>{unlockedCount}/{REWARD_TIERS.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('settings.stats.unlocks')}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => {
            hapticImpact(ImpactFeedbackStyle.Light);
            router.push('/stats');
          }}
          style={({ pressed }) => [
            styles.statsLinkRow,
            { backgroundColor: colors.surface },
            pressed && { opacity: 0.6 },
          ]}
          accessibilityLabel={t('stats.enter')}
          accessibilityRole="link"
        >
          <Text style={styles.optionIcon}>📊</Text>
          <Text style={[styles.optionText, { color: colors.textPrimary }]}>
            {t('stats.enter')}
          </Text>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
        </Pressable>

        {nextTier && (
          <View style={[styles.nextTierCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.nextTierLabel, { color: colors.textSecondary }]}>
              {t('settings.stats.nextUnlock', {
                label: t(`rewards.tier.${nextTier.flowDays}.label` as const),
              })}
            </Text>
            <View style={[styles.tierProgressBg, { backgroundColor: colors.inactive }]}>
              <View
                style={[
                  styles.tierProgressFill,
                  {
                    backgroundColor: colors.accent,
                    width: `${Math.min(100, (maxFlowEver / nextTier.flowDays) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.nextTierDesc, { color: colors.textMuted }]}>
              {t('settings.stats.nextUnlockDescription', {
                description: t(`rewards.tier.${nextTier.flowDays}.description` as const),
                current: maxFlowEver,
                target: nextTier.flowDays,
              })}
            </Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('settings.theme.title')}
        </Text>
        <View style={[styles.optionGroup, { backgroundColor: colors.surface }]}>
          {THEME_OPTIONS.map((option, index) => (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                mode === option.value && {
                  backgroundColor: colors.surfaceLight,
                },
                index < THEME_OPTIONS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.surfaceLight,
                },
              ]}
              onPress={() => {
                hapticImpact(ImpactFeedbackStyle.Light);
                setMode(option.value);
              }}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                {t(`settings.theme.${option.value}` as const)}
              </Text>
              {mode === option.value && (
                <View style={[styles.checkCircle, { backgroundColor: colors.accent }]}>
                  <Text style={styles.check}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* 알림 액션 토글은 Android에서만 노출 — iOS는 알림 카테고리 인터랙션 검증이 어려워 일시 비활성. */}
        {Platform.OS === 'android' && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              {t('settings.notifications.title')}
            </Text>
            <View style={[styles.optionGroup, { backgroundColor: colors.surface }]}>
              <View style={styles.option}>
                <Text style={styles.optionIcon}>🔔</Text>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                    {t('settings.notifications.lockScreenAction.title')}
                  </Text>
                  <Text style={[styles.optionHint, { color: colors.textMuted }]}>
                    {t('settings.notifications.lockScreenAction.subtitle')}
                  </Text>
                </View>
                <Switch
                  value={lockScreenActionEnabled}
                  onValueChange={handleToggleLockScreenAction}
                  trackColor={{ false: colors.inactive, true: colors.accent }}
                  thumbColor={'#FFFFFF'}
                  ios_backgroundColor={colors.inactive}
                />
              </View>
            </View>
          </>
        )}

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('settings.general.title')}
        </Text>
        <View style={[styles.optionGroup, { backgroundColor: colors.surface }]}>
          <Pressable
            style={({ pressed }) => [
              styles.option,
              { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surfaceLight },
              pressed && { opacity: 0.6 },
            ]}
            onPress={handleGuide}
          >
            <Text style={styles.optionIcon}>📖</Text>
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>{t('settings.general.guide')}</Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.option,
              pressed && { opacity: 0.6 },
            ]}
            onPress={handleFeedback}
          >
            <Text style={styles.optionIcon}>💬</Text>
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>{t('settings.general.feedback.menu')}</Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('settings.legal.title')}
        </Text>
        <View style={[styles.optionGroup, { backgroundColor: colors.surface }]}>
          <Pressable
            style={({ pressed }) => [
              styles.option,
              { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surfaceLight },
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => handleOpenUrl(getLegalUrl(i18n.language, 'privacy-policy'))}
            accessibilityLabel={t('settings.legal.privacy')}
            accessibilityRole="link"
          >
            <Text style={styles.optionIcon}>🔒</Text>
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>{t('settings.legal.privacy')}</Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.option,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => handleOpenUrl(getLegalUrl(i18n.language, 'terms-of-service'))}
            accessibilityLabel={t('settings.legal.terms')}
            accessibilityRole="link"
          >
            <Text style={styles.optionIcon}>📄</Text>
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>{t('settings.legal.terms')}</Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </Pressable>
        </View>

        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            {t('settings.version', { version: APP_VERSION })}
          </Text>
        </View>
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionGroup: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm + 2,
  },
  optionIcon: {
    fontSize: 18,
  },
  optionText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fontSize.md,
  },
  optionHint: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '500',
  },
  nextTierCard: {
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  nextTierLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tierProgressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  tierProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  nextTierDesc: {
    fontSize: fontSize.xs,
  },
  versionSection: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  versionText: {
    fontSize: fontSize.xs,
  },
});
