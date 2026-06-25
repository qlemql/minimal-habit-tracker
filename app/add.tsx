import { useState, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from '@/utils/haptics';
import { useHabitStore } from '@/store/habitStore';
import { useThemeStore } from '@/store/themeStore';
import { syncWidgetData } from '@/utils/widgetData';
import { useRewardStore } from '@/store/rewardStore';
import { TimePicker } from '@/components/TimePicker';
import { fontSize, spacing, habitIcons, habitColors, unlockableIcons, unlockableColors } from '@/constants/theme';
import { getUnlockedItemsFromPacks, getRequiredFlowDays } from '@/constants/rewards';

export default function AddHabitScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { addHabit } = useHabitStore();
  const colors = useThemeStore((s) => s.getColors());

  const unlockedPacks = useRewardStore((s) => s.unlockedPacks);
  const unlocked = getUnlockedItemsFromPacks(unlockedPacks);

  // 아이콘은 전부 무료 — 기본셋 + (구)팩 아이콘 합쳐 중복 제거. 색상만 보상으로 잠김.
  const allIcons = [...new Set<string>([...habitIcons, ...unlockableIcons])];
  const allColors = [...new Set<string>([...habitColors, ...unlockableColors])];

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>(habitIcons[0]);
  const [selectedColor, setSelectedColor] = useState<string>(habitColors[0]);
  const [reminderTime, setReminderTime] = useState<string | null>(null);

  // 무의존 이모지 선택 — OS 기본 키보드로 어떤 이모지든 입력. 그리드에 없는 값이면 커스텀.
  const emojiRef = useRef<TextInput>(null);
  const isCustomIcon = !allIcons.includes(selectedIcon);
  const handleEmojiPick = (text: string) => {
    const trimmed = text.trim();
    emojiRef.current?.clear();
    emojiRef.current?.blur();
    // ASCII(평문 글자/숫자)는 거르고 이모지·기호만 허용
    if (trimmed && trimmed.charCodeAt(0) > 127) {
      hapticImpact(ImpactFeedbackStyle.Light);
      setSelectedIcon(trimmed);
    }
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert(t('add.alert.noticeTitle'), t('add.alert.emptyName'));
      return;
    }

    const newId = addHabit(trimmed, selectedIcon, selectedColor);
    if (!newId) {
      Alert.alert(t('add.alert.noticeTitle'), t('add.alert.limitBody'));
      return;
    }

    if (reminderTime) {
      await useHabitStore.getState().updateHabit(newId, { reminderTime });
    }

    hapticNotification(NotificationFeedbackType.Success);
    await syncWidgetData();
    router.back();
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('add.title')}</Text>
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
            style={[
              styles.previewIcon,
              { backgroundColor: selectedColor + '20' },
            ]}
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
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('add.label.icon')}</Text>
          <View style={styles.grid}>
            {allIcons.map((icon) => (
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
                accessibilityLabel={t('add.a11y.icon', { icon })}
                accessibilityRole="button"
              >
                <Text style={styles.gridIcon}>{icon}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[
                styles.gridItem,
                styles.gridItemMore,
                { borderColor: colors.textMuted },
                isCustomIcon && {
                  borderColor: selectedColor,
                  borderStyle: 'solid',
                  backgroundColor: selectedColor + '15',
                },
              ]}
              onPress={() => emojiRef.current?.focus()}
              accessibilityLabel={t('add.a11y.customIcon')}
              accessibilityRole="button"
            >
              <Text style={styles.gridIcon}>{isCustomIcon ? selectedIcon : '➕'}</Text>
            </Pressable>
          </View>
          <TextInput
            ref={emojiRef}
            onChangeText={handleEmojiPick}
            style={styles.hiddenEmojiInput}
            caretHidden
            autoCorrect={false}
            importantForAccessibility="no-hide-descendants"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('add.label.color')}</Text>
          <View style={styles.colorGrid}>
            {allColors.map((color) => {
              const isBase = (habitColors as readonly string[]).includes(color);
              const requiredDays = isBase ? 0 : getRequiredFlowDays(color, 'color');
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
      </ScrollView>
      </KeyboardAvoidingView>
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
  cancel: {
    fontSize: fontSize.md,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  save: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  saveDisabled: {
    opacity: 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
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
  previewIconText: {
    fontSize: 40,
  },
  previewName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 14,
    padding: spacing.md,
    fontSize: fontSize.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridIcon: {
    fontSize: 24,
  },
  gridItemMore: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  hiddenEmojiInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
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
});
