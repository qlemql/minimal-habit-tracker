import { View, Text, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { hapticImpact, ImpactFeedbackStyle } from '@/utils/haptics';
import { useThemeStore } from '@/store/themeStore';
import { useHabitStore } from '@/store/habitStore';
// onboardingStore no longer needed for guide
import { fontSize, spacing } from '@/constants/theme';

const FEEDBACK_EMAIL = 'taehyun_fe@naver.com';

type ThemeOption = 'dark' | 'light' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: string }[] = [
  { value: 'dark', label: '다크', icon: '🌙' },
  { value: 'light', label: '라이트', icon: '☀️' },
  { value: 'system', label: '시스템', icon: '📱' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useThemeStore((s) => s.getColors());
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const { habits, logs } = useHabitStore();
  const totalLogs = logs.filter((l) => l.completed).length;

  const handleFeedback = async () => {
    const canOpen = await Linking.canOpenURL(`mailto:${FEEDBACK_EMAIL}`);
    if (canOpen) {
      Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=Minimal Habit Tracker 피드백`);
    } else {
      await Clipboard.setStringAsync(FEEDBACK_EMAIL);
      Alert.alert('이메일 복사됨', `${FEEDBACK_EMAIL}\n클립보드에 복사되었습니다.`);
    }
  };

  const handleGuide = () => {
    router.push({ pathname: '/onboarding', params: { guideOnly: '1' } });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => { hapticImpact(ImpactFeedbackStyle.Light); router.back(); }}
          hitSlop={12}
          accessibilityLabel="뒤로"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.surface },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={[styles.backIcon, { color: colors.textSecondary }]}>‹</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>설정</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* 통계 요약 */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{habits.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>습관</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.surfaceLight }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{totalLogs}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>총 달성</Text>
          </View>
        </View>

        {/* 테마 */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          테마
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
                {option.label}
              </Text>
              {mode === option.value && (
                <View style={[styles.checkCircle, { backgroundColor: colors.accent }]}>
                  <Text style={styles.check}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* 일반 */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          일반
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
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>사용 가이드</Text>
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
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>피드백 보내기</Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </Pressable>
        </View>

        {/* 버전 정보 */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            Minimal Habit Tracker v1.0.0
          </Text>
        </View>
      </View>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
  versionSection: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  versionText: {
    fontSize: fontSize.xs,
  },
});
