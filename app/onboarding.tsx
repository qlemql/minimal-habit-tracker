import { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useThemeStore } from '@/store/themeStore';
import { fontSize, spacing, habitIcons, habitColors } from '@/constants/theme';

interface HabitDraft {
  name: string;
  icon: string;
  color: string;
}

const PRESETS: HabitDraft[] = [
  { name: '물 2L 마시기', icon: '💧', color: habitColors[0] },
  { name: '30분 운동', icon: '🏃', color: habitColors[2] },
  { name: '독서 30분', icon: '📖', color: habitColors[1] },
  { name: '명상 10분', icon: '🧘', color: habitColors[3] },
  { name: '비타민 먹기', icon: '💊', color: habitColors[5] },
  { name: '일기 쓰기', icon: '✍️', color: habitColors[4] },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { addHabit } = useHabitStore();
  const { setCompleted } = useOnboardingStore();
  const colors = useThemeStore((s) => s.getColors());

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<HabitDraft[]>([]);
  const [customName, setCustomName] = useState('');

  const togglePreset = (preset: HabitDraft) => {
    const exists = selected.find((s) => s.name === preset.name);
    if (exists) {
      setSelected(selected.filter((s) => s.name !== preset.name));
    } else if (selected.length < 3) {
      setSelected([...selected, preset]);
    }
  };

  const addCustom = () => {
    if (customName.trim() && selected.length < 3) {
      setSelected([
        ...selected,
        {
          name: customName.trim(),
          icon: habitIcons[selected.length % habitIcons.length],
          color: habitColors[selected.length % habitColors.length],
        },
      ]);
      setCustomName('');
    }
  };

  const handleFinish = () => {
    selected.forEach((h) => addHabit(h.name, h.icon, h.color));
    setCompleted();
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {step === 0 && (
        <View style={styles.welcome}>
          <Text style={styles.welcomeEmoji}>✨</Text>
          <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
            딱 3개만{'\n'}골라보세요
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            적게 추적할수록 더 잘 지키게 됩니다
          </Text>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: habitColors[0] }]}
            onPress={() => setStep(1)}
          >
            <Text style={styles.primaryButtonText}>시작하기</Text>
          </Pressable>
        </View>
      )}

      {step === 1 && (
        <View style={styles.selectStep}>
          <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
            습관을 골라보세요
          </Text>
          <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
            {selected.length}/3개 선택됨
          </Text>

          <ScrollView style={styles.presetList} showsVerticalScrollIndicator={false}>
            {PRESETS.map((preset) => {
              const isSelected = selected.some((s) => s.name === preset.name);
              return (
                <Pressable
                  key={preset.name}
                  style={[
                    styles.presetItem,
                    { backgroundColor: colors.surface },
                    isSelected && { borderColor: preset.color, borderWidth: 2 },
                  ]}
                  onPress={() => togglePreset(preset)}
                >
                  <Text style={styles.presetIcon}>{preset.icon}</Text>
                  <Text style={[styles.presetName, { color: colors.textPrimary }]}>
                    {preset.name}
                  </Text>
                  {isSelected && <Text style={styles.presetCheck}>✓</Text>}
                </Pressable>
              );
            })}

            {/* 직접 입력 */}
            <View style={[styles.customInput, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.customTextInput, { color: colors.textPrimary }]}
                value={customName}
                onChangeText={setCustomName}
                placeholder="직접 입력..."
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={addCustom}
                returnKeyType="done"
                maxLength={30}
              />
              {customName.trim() && selected.length < 3 && (
                <Pressable onPress={addCustom}>
                  <Text style={[styles.addCustom, { color: habitColors[0] }]}>추가</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>

          <Pressable
            style={[
              styles.primaryButton,
              { backgroundColor: habitColors[0] },
              selected.length === 0 && styles.buttonDisabled,
            ]}
            onPress={handleFinish}
            disabled={selected.length === 0}
          >
            <Text style={styles.primaryButtonText}>
              {selected.length > 0
                ? `${selected.length}개 습관으로 시작`
                : '습관을 선택해주세요'}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcome: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 44,
  },
  welcomeSubtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  primaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  selectStep: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  stepTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  presetList: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  presetName: {
    fontSize: fontSize.md,
    flex: 1,
  },
  presetCheck: {
    fontSize: fontSize.md,
    color: '#4A90D9',
    fontWeight: '600',
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  customTextInput: {
    flex: 1,
    fontSize: fontSize.md,
  },
  addCustom: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
