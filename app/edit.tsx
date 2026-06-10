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
import { useTranslation } from 'react-i18next';
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';
import { useHabitStore } from '@/store/habitStore';
import { useThemeStore } from '@/store/themeStore';
import { syncWidgetData } from '@/utils/widgetData';
import { useRewardStore } from '@/store/rewardStore';
import { calculateFlow } from '@/utils/streak';
import { TimePicker } from '@/components/TimePicker';
import { fontSize, spacing, habitIcons, habitColors, unlockableIcons, unlockableColors } from '@/constants/theme';
import { getUnlockedItemsFromPacks, getRequiredFlowDays } from '@/constants/rewards';

export default function EditHabitScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, updateHabit, deleteHabit, graduateHabit } = useHabitStore();
  const colors = useThemeStore((s) => s.getColors());

  const unlockedPacks = useRewardStore((s) => s.unlockedPacks);
  const unlocked = getUnlockedItemsFromPacks(unlockedPacks);

  const allIcons = [...habitIcons, ...unlockableIcons];
  const allColors = [...habitColors, ...unlockableColors];

  const habit = habits.find((h) => h.id === id);

  // 졸업 액션 노출 임계값 — 떡잎(7일)부터. 50일 이상이면 정시 졸업 라벨.
  const GRADUATION_MIN_DAYS = 7;
  const GRADUATION_FULL_DAYS = 50;

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
      Alert.alert(t('add.alert.noticeTitle'), t('add.alert.emptyName'));
      return;
    }
    await updateHabit(habit.id, {
      name: trimmed,
      icon: selectedIcon,
      color: selectedColor,
      reminderTime,
    });
    hapticNotification(NotificationFeedbackType.Success);
    await syncWidgetData();
    router.back();
  };

  const handleGraduate = () => {
    if (!habit) return;
    const { logs } = useHabitStore.getState();
    const flow = calculateFlow(habit.id, logs);
    // 졸업 자격은 한 번이라도 도달한 최장 흐름 기준 — 카드 단계 표시(longestFlow)와 일관.
    const flowDays = flow.longestFlow;
    const isFull = flowDays >= GRADUATION_FULL_DAYS;
    const daysLeft = Math.max(0, GRADUATION_FULL_DAYS - flowDays);

    Alert.alert(
      isFull ? t('graduation.fullDialog.title') : t('graduation.earlyDialog.title'),
      isFull
        ? t('graduation.fullDialog.body')
        : t('graduation.earlyDialog.body', { days: daysLeft }),
      [
        {
          text: isFull ? t('graduation.fullDialog.cancel') : t('graduation.earlyDialog.cancel'),
          style: 'cancel',
        },
        {
          text: isFull ? t('graduation.fullDialog.confirm') : t('graduation.earlyDialog.confirm'),
          style: 'default',
          onPress: async () => {
            graduateHabit(habit.id);
            hapticNotification(NotificationFeedbackType.Success);
            await syncWidgetData();
            router.back();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    const { logs } = useHabitStore.getState();
    const flow = calculateFlow(habit.id, logs);
    const logCount = logs.filter((l) => l.habitId === habit.id && l.completed).length;
    const warning = logCount > 0
      ? flow.currentFlowDays > 0
        ? t('edit.delete.warningWithFlow', { logCount, flowDays: flow.currentFlowDays })
        : t('edit.delete.warningOnlyLogs', { logCount })
      : '';
    const body = warning
      ? t('edit.delete.bodyWithWarning', { name: habit.name, warning })
      : t('edit.delete.bodyEmpty', { name: habit.name });
    Alert.alert(t('edit.delete.alertTitle'), body, [
      { text: t('edit.delete.cancel'), style: 'cancel' },
      {
        text: t('edit.delete.confirm'),
        style: 'destructive',
        onPress: async () => {
          deleteHabit(habit.id);
          await syncWidgetData();
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
          accessibilityLabel={t('add.a11y.cancel')}
          accessibilityRole="button"
          style={({ pressed }) => pressed && { opacity: 0.6 }}
        >
          <Text style={[styles.cancel, { color: colors.textSecondary }]}>{t('add.cancel')}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('edit.title')}</Text>
        <Pressable onPress={handleSave} hitSlop={12} accessibilityLabel={t('add.a11y.save')} accessibilityRole="button">
          <Text style={[styles.save, { color: colors.accent }, !name.trim() && styles.saveDisabled]}>
            {t('add.save')}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView overScrollMode="never" style={styles.content} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
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
            {name.trim() || t('add.placeholderName')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('add.label.name')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]}
            value={name}
            onChangeText={setName}
            placeholder={t('add.input.placeholder')}
            placeholderTextColor={colors.textMuted}
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('add.label.icon')}</Text>
          <View style={styles.grid}>
            {allIcons.map((icon) => {
              const requiredDays = getRequiredFlowDays(icon, 'icon');
              const isLocked = requiredDays > 0 && !unlocked.icons.includes(icon);
              return (
                <Pressable
                  key={icon}
                  style={[
                    styles.gridItem,
                    { backgroundColor: colors.surface },
                    selectedIcon === icon && !isLocked && {
                      borderColor: selectedColor,
                      borderWidth: 2,
                      backgroundColor: selectedColor + '15',
                    },
                    isLocked && { opacity: 0.4 },
                  ]}
                  onPress={() => {
                    if (isLocked) {
                      Alert.alert(t('add.alert.lockedTitle'), t('add.alert.lockedBody', { days: requiredDays }));
                      return;
                    }
                    hapticImpact(ImpactFeedbackStyle.Light);
                    setSelectedIcon(icon);
                  }}
                  accessibilityLabel={isLocked
                    ? t('add.a11y.lockedIcon', { days: requiredDays })
                    : t('add.a11y.icon', { icon })}
                  accessibilityRole="button"
                >
                  <Text style={[styles.gridIcon, isLocked && { opacity: 0.3 }]}>{icon}</Text>
                  {isLocked && <Text style={styles.lockBadge}>🔒</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('add.label.color')}</Text>
          <View style={styles.colorGrid}>
            {allColors.map((color) => {
              const requiredDays = getRequiredFlowDays(color, 'color');
              const isLocked = requiredDays > 0 && !unlocked.colors.includes(color);
              return (
                <Pressable
                  key={color}
                  style={[
                    styles.colorItem,
                    { backgroundColor: isLocked ? colors.inactive : color },
                    selectedColor === color && !isLocked && {
                      borderColor: colors.textPrimary,
                      transform: [{ scale: 1.15 }],
                    },
                    isLocked && { opacity: 0.5 },
                  ]}
                  onPress={() => {
                    if (isLocked) {
                      Alert.alert(t('add.alert.lockedTitle'), t('add.alert.lockedBody', { days: requiredDays }));
                      return;
                    }
                    hapticImpact(ImpactFeedbackStyle.Light);
                    setSelectedColor(color);
                  }}
                  accessibilityLabel={isLocked
                    ? t('add.a11y.lockedColor', { days: requiredDays })
                    : t('add.a11y.color', { color })}
                  accessibilityRole="button"
                >
                  {isLocked && <Text style={styles.lockBadge}>🔒</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('add.label.reminder')}</Text>
          <TimePicker value={reminderTime} onChange={setReminderTime} />
        </View>

        {(() => {
          const { logs } = useHabitStore.getState();
          const flow = calculateFlow(habit.id, logs);
          if (flow.longestFlow < GRADUATION_MIN_DAYS) return null;
          const isFull = flow.longestFlow >= GRADUATION_FULL_DAYS;
          const label = isFull
            ? t('graduation.action.graduate')
            : t('graduation.action.earlyGraduate');
          return (
            <Pressable
              style={[styles.graduateButton, { backgroundColor: colors.accent + '15' }]}
              onPress={handleGraduate}
              accessibilityLabel={label}
              accessibilityRole="button"
            >
              <Text style={[styles.graduateText, { color: colors.accent }]}>
                🌸 {label}
              </Text>
            </Pressable>
          );
        })()}

        <Pressable
          style={[styles.deleteButton, { backgroundColor: colors.danger + '15' }]}
          onPress={handleDelete}
          accessibilityLabel={t('edit.delete.a11y')}
          accessibilityRole="button"
        >
          <Text style={[styles.deleteText, { color: colors.danger }]}>{t('edit.delete.button')}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    fontSize: 10,
  },
  graduateButton: {
    marginTop: spacing.sm,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: 14,
  },
  graduateText: { fontSize: fontSize.md, fontWeight: '600' },
  deleteButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: 14,
  },
  deleteText: { fontSize: fontSize.md, fontWeight: '600' },
});
