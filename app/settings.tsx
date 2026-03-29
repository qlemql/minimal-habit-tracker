import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { fontSize, spacing } from '@/constants/theme';

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
  check: {
    fontSize: fontSize.md,
    color: '#4A90D9',
  },
});
