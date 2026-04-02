import { useState, useRef } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  FadeIn,
  SlideInRight,
  SlideOutLeft,
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';
import { useHabitStore } from '@/store/habitStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useThemeStore } from '@/store/themeStore';
import { fontSize, spacing, habitIcons, habitColors } from '@/constants/theme';

interface HabitDraft {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

const PRESETS: HabitDraft[] = [
  { id: 'p1', name: '물 2L 마시기', icon: '💧', color: habitColors[0] },
  { id: 'p2', name: '30분 운동', icon: '🏃', color: habitColors[2] },
  { id: 'p3', name: '독서 30분', icon: '📖', color: habitColors[1] },
  { id: 'p4', name: '명상 10분', icon: '🧘', color: habitColors[3] },
  { id: 'p5', name: '비타민 먹기', icon: '💊', color: habitColors[5] },
  { id: 'p6', name: '일기 쓰기', icon: '✍️', color: habitColors[4] },
];

function AnimatedCounterDot({ filled, accentColor, inactiveColor }: { filled: boolean; accentColor: string; inactiveColor: string }) {
  return (
    <View
      style={[
        styles.counterDot,
        { backgroundColor: filled ? accentColor : inactiveColor },
      ]}
    />
  );
}

function SimpleCheckbox({ selected, color, inactiveColor }: { selected: boolean; color: string; inactiveColor: string }) {
  return (
    <View
      style={[
        styles.presetCheckbox,
        selected
          ? { backgroundColor: color }
          : { borderWidth: 2, borderColor: inactiveColor },
      ]}
    >
      {selected && <Text style={styles.presetCheckmark}>✓</Text>}
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { guideOnly } = useLocalSearchParams<{ guideOnly?: string }>();
  const isGuideOnly = guideOnly === '1';
  const { addHabit } = useHabitStore();
  const { setCompleted } = useOnboardingStore();
  const colors = useThemeStore((s) => s.getColors());

  const [step, setStep] = useState(isGuideOnly ? 2 : 0);
  const [selected, setSelected] = useState<HabitDraft[]>([]);
  const [customName, setCustomName] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const toggleItem = (item: HabitDraft) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    const exists = selected.find((s) => s.id === item.id);
    if (exists) {
      setSelected(selected.filter((s) => s.id !== item.id));
    } else if (selected.length < 3) {
      setSelected([...selected, item]);
    }
  };

  const addCustom = () => {
    if (customName.trim() && selected.length < 3) {
      hapticImpact(ImpactFeedbackStyle.Light);
      const newItem: HabitDraft = {
        id: `custom_${Date.now()}`,
        name: customName.trim(),
        icon: habitIcons[(selected.length + 6) % habitIcons.length],
        color: habitColors[(selected.length + 3) % habitColors.length],
        isCustom: true,
      };
      setSelected([...selected, newItem]);
      setCustomName('');
      Keyboard.dismiss();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleFinish = () => {
    hapticNotification(NotificationFeedbackType.Success);
    selected.forEach((h) => addHabit(h.name, h.icon, h.color));
    setCompleted();
    router.replace('/');
  };

  // 프리셋과 커스텀 합쳐서 표시할 항목들
  const customItems = selected.filter((s) => s.isCustom);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {step === 0 && (
        <Animated.View
          entering={FadeIn.duration(600)}
          exiting={SlideOutLeft.duration(300)}
          style={styles.welcome}
        >
          <View style={[styles.emojiCircle, { backgroundColor: colors.surface }]}>
            <Text style={styles.welcomeEmoji}>✨</Text>
          </View>
          <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
            딱 3개만{'\n'}집중해보세요
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            많으면 지치고, 적으면 지켜져요
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.accent },
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => {
              hapticImpact(ImpactFeedbackStyle.Light);
              setStep(1);
            }}
          >
            <Text style={styles.primaryButtonText}>시작하기</Text>
          </Pressable>
        </Animated.View>
      )}

      {step === 1 && (
        <Animated.View
          entering={SlideInRight.duration(300)}
          style={styles.selectStep}
        >
          <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
            어떤 습관을 만들어볼까요?
          </Text>
          <View style={styles.counterRow}>
            {[0, 1, 2].map((i) => (
              <AnimatedCounterDot
                key={i}
                filled={i < selected.length}
                accentColor={colors.accent}
                inactiveColor={colors.surfaceLight}
              />
            ))}
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              {selected.length}/3개 선택됨
            </Text>
          </View>

          <ScrollView ref={scrollRef} style={styles.presetList} showsVerticalScrollIndicator={false}>
            {PRESETS.map((preset) => {
              const isSelected = selected.some((s) => s.id === preset.id);
              return (
                <Pressable
                  key={preset.id}
                  style={[
                    styles.presetItem,
                    { backgroundColor: colors.surface },
                    isSelected && {
                      borderColor: preset.color,
                      borderWidth: 2,
                      backgroundColor: preset.color + '10',
                    },
                  ]}
                  onPress={() => toggleItem(preset)}
                >
                  <View style={[styles.presetIconBg, { backgroundColor: preset.color + '20' }]}>
                    <Text style={styles.presetIcon}>{preset.icon}</Text>
                  </View>
                  <Text style={[styles.presetName, { color: colors.textPrimary }]}>
                    {preset.name}
                  </Text>
                  <SimpleCheckbox
                    selected={isSelected}
                    color={preset.color}
                    inactiveColor={colors.inactive}
                  />
                </Pressable>
              );
            })}

            {/* 직접 추가한 습관들 (프리셋과 동일한 카드 형태) */}
            {customItems.map((item) => (
              <Animated.View key={item.id} entering={FadeInDown.duration(300)} exiting={FadeOut.duration(150)}>
                <Pressable
                  style={[
                    styles.presetItem,
                    {
                      backgroundColor: item.color + '10',
                      borderColor: item.color,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => toggleItem(item)}
                >
                  <View style={[styles.presetIconBg, { backgroundColor: item.color + '20' }]}>
                    <Text style={styles.presetIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.presetName, { color: colors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <SimpleCheckbox
                    selected={true}
                    color={item.color}
                    inactiveColor={colors.inactive}
                  />
                </Pressable>
              </Animated.View>
            ))}

            {/* 직접 입력 */}
            {selected.length < 3 && (
              <View style={[styles.customInput, { backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.customTextInput, { color: colors.textPrimary }]}
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="나만의 습관 입력..."
                  placeholderTextColor={colors.textMuted}
                  onSubmitEditing={addCustom}
                  returnKeyType="done"
                  maxLength={30}
                />
                {customName.trim().length > 0 && (
                  <Pressable
                    style={[styles.addCustomButton, { backgroundColor: colors.accent }]}
                    onPress={addCustom}
                  >
                    <Text style={styles.addCustomText}>추가</Text>
                  </Pressable>
                )}
              </View>
            )}
          </ScrollView>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.accent },
              selected.length === 0 && styles.buttonDisabled,
              pressed && selected.length > 0 && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => {
              hapticImpact(ImpactFeedbackStyle.Light);
              setStep(2);
            }}
            disabled={selected.length === 0}
          >
            <Text style={styles.primaryButtonText}>
              {selected.length > 0
                ? '다음'
                : '습관을 선택해주세요'}
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {step === 2 && (
        <Animated.View
          entering={SlideInRight.duration(300)}
          style={styles.guideStep}
        >
          <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
            이렇게 사용해요
          </Text>

          <View style={styles.guideList}>
            {/* 이어가기 — 가장 중요한 차별점, 강조 카드 */}
            <View style={[styles.guideCardHighlight, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}>
              <Text style={styles.guideHighlightEmoji}>🌊</Text>
              <Text style={[styles.guideHighlightTitle, { color: colors.textPrimary }]}>
                하루 쉬어도 괜찮아요
              </Text>
              <Text style={[styles.guideHighlightDesc, { color: colors.textSecondary }]}>
                하루 빠져도 흐름은 이어져요.{'\n'}이틀 연속 빠지면 새로운 시작.
              </Text>
              <View style={styles.guideFlowExample}>
                <Text style={[styles.guideFlowDots, { color: colors.accent }]}>● ● ◌ ● ● ●</Text>
                <Text style={[styles.guideFlowLabel, { color: colors.textMuted }]}>◌ = 쉼표 (흐름 유지)</Text>
              </View>
            </View>

            <View style={[styles.guideCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.guideEmoji}>👆</Text>
              <View style={styles.guideTextWrap}>
                <Text style={[styles.guideTitle, { color: colors.textPrimary }]}>탭으로 체크</Text>
                <Text style={[styles.guideDesc, { color: colors.textSecondary }]}>
                  습관 카드를 탭하면 오늘 완료
                </Text>
              </View>
            </View>

            <View style={[styles.guideCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.guideEmoji}>✏️</Text>
              <View style={styles.guideTextWrap}>
                <Text style={[styles.guideTitle, { color: colors.textPrimary }]}>길게 눌러 수정</Text>
                <Text style={[styles.guideDesc, { color: colors.textSecondary }]}>
                  이름, 아이콘, 알림을 변경할 수 있어요
                </Text>
              </View>
            </View>

            <View style={[styles.guideCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.guideEmoji}>📅</Text>
              <View style={styles.guideTextWrap}>
                <Text style={[styles.guideTitle, { color: colors.textPrimary }]}>스와이프로 주간 이동</Text>
                <Text style={[styles.guideDesc, { color: colors.textSecondary }]}>
                  지난 주 기록도 확인할 수 있어요
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.accent },
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={isGuideOnly ? () => router.back() : handleFinish}
          >
            <Text style={styles.primaryButtonText}>
              {isGuideOnly ? '확인' : `${selected.length}개로 시작하기`}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  welcome: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emojiCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeEmoji: { fontSize: 48 },
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
    lineHeight: 24,
  },
  primaryButton: {
    paddingVertical: 16,
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
  buttonDisabled: { opacity: 0.4 },
  selectStep: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  stepTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  counterDot: { width: 8, height: 8, borderRadius: 4 },
  stepSubtitle: { fontSize: fontSize.sm, marginLeft: spacing.xs },
  presetList: { flex: 1, marginBottom: spacing.lg },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetIcon: { fontSize: 20 },
  presetName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    flex: 1,
    marginLeft: spacing.md,
  },
  presetCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.sm,
  },
  customTextInput: { flex: 1, fontSize: fontSize.md },
  guideStep: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  guideList: {
    flex: 1,
    gap: spacing.sm + 2,
    marginTop: spacing.md,
  },
  guideCardHighlight: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  guideHighlightEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  guideHighlightTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  guideHighlightDesc: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  guideFlowExample: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  guideFlowDots: {
    fontSize: fontSize.md,
    fontWeight: '600',
    letterSpacing: 2,
  },
  guideFlowLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
  },
  guideEmoji: {
    fontSize: 24,
    width: 44,
    textAlign: 'center',
  },
  guideTextWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  guideTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  guideDesc: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  addCustomButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  addCustomText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
