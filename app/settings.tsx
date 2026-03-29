import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { useProStore } from '@/store/proStore';
import { purchasePro, restorePurchases } from '@/utils/purchases';
import { fontSize, spacing, habitColors } from '@/constants/theme';

type ThemeOption = 'dark' | 'light' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'dark', label: '다크' },
  { value: 'light', label: '라이트' },
  { value: 'system', label: '시스템' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useThemeStore((s) => s.getColors());
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const isPro = useProStore((s) => s.isPro);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    const success = await purchasePro();
    setPurchasing(false);
    if (success) {
      Alert.alert('감사합니다!', 'Pro 기능이 활성화되었습니다.');
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const success = await restorePurchases();
    setPurchasing(false);
    if (success) {
      Alert.alert('복원 완료', 'Pro 기능이 복원되었습니다.');
    } else {
      Alert.alert('복원 실패', '구매 내역을 찾을 수 없습니다.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.textSecondary }]}>← 뒤로</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>설정</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        {/* Pro */}
        {!isPro && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Pro
            </Text>
            <View style={[styles.proCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.proTitle, { color: colors.textPrimary }]}>
                Pro로 업그레이드
              </Text>
              <Text style={[styles.proDesc, { color: colors.textSecondary }]}>
                무제한 습관 · 상세 통계
              </Text>
              <Pressable
                style={[styles.proButton, { backgroundColor: habitColors[0] }]}
                onPress={handlePurchase}
                disabled={purchasing}
              >
                <Text style={styles.proButtonText}>
                  {purchasing ? '처리 중...' : '₩6,500 1회 결제'}
                </Text>
              </Pressable>
              <Pressable onPress={handleRestore} disabled={purchasing}>
                <Text style={[styles.restoreText, { color: colors.textMuted }]}>
                  구매 복원
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {isPro && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Pro
            </Text>
            <View style={[styles.optionGroup, { backgroundColor: colors.surface }]}>
              <Pressable
                style={styles.option}
                onPress={() => router.push('/stats')}
              >
                <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                  📊 통계
                </Text>
                <Text style={[styles.optionArrow, { color: colors.textMuted }]}>›</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* 테마 */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          테마
        </Text>
        <View style={[styles.optionGroup, { backgroundColor: colors.surface }]}>
          {THEME_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                mode === option.value && {
                  backgroundColor: colors.surfaceLight,
                },
              ]}
              onPress={() => setMode(option.value)}
            >
              <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                {option.label}
              </Text>
              {mode === option.value && (
                <Text style={styles.check}>✓</Text>
              )}
            </Pressable>
          ))}
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
  back: {
    fontSize: fontSize.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  proCard: {
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  proTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  proDesc: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  proButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  proButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  restoreText: {
    fontSize: fontSize.sm,
    paddingVertical: spacing.sm,
  },
  optionGroup: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  optionText: {
    fontSize: fontSize.md,
  },
  optionArrow: {
    fontSize: fontSize.lg,
  },
  check: {
    fontSize: fontSize.md,
    color: '#4A90D9',
  },
});
