import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';
import { useHabitStore } from '@/store/habitStore';
import { useThemeStore } from '@/store/themeStore';
import { calculateFlow } from '@/utils/streak';
import { TimePicker } from '@/components/TimePicker';
import { fontSize, spacing, habitIcons, habitColors } from '@/constants/theme';

export default function EditHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, updateHabit, deleteHabit } = useHabitStore();
  const colors = useThemeStore((s) => s.getColors());

  const habit = habits.find((h) => h.id === id);

  const [name, setName] = useState(habit?.name ?? '');
  const [selectedIcon, setSelectedIcon] = useState(habit?.icon ?? habitIcons[0]);
  const [selectedColor, setSelectedColor] = useState(
    habit?.color ?? habitColors[0]
  );
  const [reminderTime, setReminderTime] = useState<string | null>(
    habit?.reminderTime ?? null
  );

  useEffect(() => {
    if (!habit) router.back();
  }, [habit, router]);

  if (!habit) return null;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('알림', '습관 이름을 입력해주세요.');
      return;
    }
    await updateHabit(habit.id, {
      name: trimmed,
      icon: selectedIcon,
      color: selectedColor,
      reminderTime,
    });
    hapticNotification(NotificationFeedbackType.Success);
    router.back();
  };

  const handleDelete = () => {
    const { logs } = useHabitStore.getState();
    const flow = calculateFlow(habit.id, logs);
    const logCount = logs.filter((l) => l.habitId === habit.id && l.completed).length;
    const warning = logCount > 0
      ? `${logCount}일간의 기록${flow.currentFlowDays > 0 ? `과 흐름 ${flow.currentFlowDays}일` : ''}이 함께 삭제됩니다.`
      : '';
    Alert.alert('습관 삭제', `"${habit.name}"을(를) 삭제하시겠어요?${warning ? '\n' + warning : ''}`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteHabit(habit.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => { hapticImpact(ImpactFeedbackStyle.Light); router.back(); }}
          hitSlop={12}
          accessibilityLabel="취소"
          accessibilityRole="button"
          style={({ pressed }) => pressed && { opacity: 0.6 }}
        >
          <Text style={[styles.cancel, { color: colors.textSecondary }]}>취소</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>습관 수정</Text>
        <Pressable onPress={handleSave} hitSlop={12} accessibilityLabel="저장" accessibilityRole="button">
          <Text style={[styles.save, { color: colors.accent }, !name.trim() && styles.saveDisabled]}>
            저장
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
        <View style={[styles.preview, { backgroundColor: colors.surface, borderRadius: 20 }]}>
          <View
            style={[styles.previewIcon, { backgroundColor: selectedColor + '20' }]}
          >
            <Text style={styles.previewIconText}>{selectedIcon}</Text>
          </View>
          <Text
            style={[styles.previewName, { color: colors.textPrimary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {name.trim() || '습관 이름'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>이름</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]}
            value={name}
            onChangeText={setName}
            placeholder="예: 물 2L 마시기"
            placeholderTextColor={colors.textMuted}
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>아이콘</Text>
          <View style={styles.grid}>
            {habitIcons.map((icon) => (
              <Pressable
                key={icon}
                style={[
                  styles.gridItem,
                  { backgroundColor: colors.surface },
                  selectedIcon === icon && {
                    borderColor: selectedColor,
                    borderWidth: 2,
                    backgroundColor: selectedColor + '15',
                  },
                ]}
                onPress={() => {
                  hapticImpact(ImpactFeedbackStyle.Light);
                  setSelectedIcon(icon);
                }}
                accessibilityLabel={`아이콘 ${icon}`}
                accessibilityRole="button"
              >
                <Text style={styles.gridIcon}>{icon}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>색상</Text>
          <View style={styles.colorGrid}>
            {habitColors.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorItem,
                  { backgroundColor: color },
                  selectedColor === color && {
                    borderColor: colors.textPrimary,
                    transform: [{ scale: 1.15 }],
                  },
                ]}
                onPress={() => {
                  hapticImpact(ImpactFeedbackStyle.Light);
                  setSelectedColor(color);
                }}
                accessibilityLabel={`색상 ${color}`}
                accessibilityRole="button"
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>알림</Text>
          <TimePicker value={reminderTime} onChange={setReminderTime} />
        </View>

        <Pressable
          style={[styles.deleteButton, { backgroundColor: colors.danger + '15' }]}
          onPress={handleDelete}
          accessibilityLabel="습관 삭제"
          accessibilityRole="button"
        >
          <Text style={[styles.deleteText, { color: colors.danger }]}>습관 삭제</Text>
        </Pressable>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cancel: { fontSize: fontSize.md },
  headerTitle: { fontSize: fontSize.md, fontWeight: '600' },
  save: { fontSize: fontSize.md, fontWeight: '600' },
  saveDisabled: { opacity: 0.4 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  preview: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  previewIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  previewIconText: { fontSize: 40 },
  previewName: { fontSize: fontSize.lg, fontWeight: '600' },
  section: { marginBottom: spacing.lg },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: { borderRadius: 14, padding: spacing.md, fontSize: fontSize.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridItem: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridIcon: { fontSize: 24 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  deleteButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: 14,
  },
  deleteText: { fontSize: fontSize.md, fontWeight: '600' },
});
