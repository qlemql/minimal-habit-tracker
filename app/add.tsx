import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { useThemeStore } from '@/store/themeStore';
import { TimePicker } from '@/components/TimePicker';
import { scheduleHabitReminder } from '@/utils/notifications';
import { fontSize, spacing, habitIcons, habitColors } from '@/constants/theme';

export default function AddHabitScreen() {
  const router = useRouter();
  const { addHabit } = useHabitStore();
  const colors = useThemeStore((s) => s.getColors());

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>(habitIcons[0]);
  const [selectedColor, setSelectedColor] = useState<string>(habitColors[0]);
  const [reminderTime, setReminderTime] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('알림', '습관 이름을 입력해주세요.');
      return;
    }

    const newId = addHabit(trimmed, selectedIcon, selectedColor);
    if (!newId) {
      Alert.alert('알림', '습관은 최대 3개까지만 등록할 수 있어요.');
      return;
    }

    if (reminderTime) {
      await scheduleHabitReminder(newId, trimmed, reminderTime);
      await useHabitStore.getState().updateHabit(newId, { reminderTime });
    }

    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.cancel, { color: colors.textSecondary }]}>취소</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>습관 추가</Text>
        <Pressable onPress={handleSave} hitSlop={12}>
          <Text style={[styles.save, !name.trim() && styles.saveDisabled]}>
            저장
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.preview}>
          <View
            style={[
              styles.previewIcon,
              { backgroundColor: selectedColor + '20' },
            ]}
          >
            <Text style={styles.previewIconText}>{selectedIcon}</Text>
          </View>
          <Text style={[styles.previewName, { color: colors.textPrimary }]}>
            {name.trim() || '습관 이름'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>이름</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]}
            value={name}
            onChangeText={setName}
            placeholder="예: 물 2L 마시기"
            placeholderTextColor={colors.textMuted}
            maxLength={30}
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>아이콘</Text>
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
                  },
                ]}
                onPress={() => setSelectedIcon(icon)}
                accessibilityLabel={`아이콘 ${icon}`}
                accessibilityRole="button"
              >
                <Text style={styles.gridIcon}>{icon}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>색상</Text>
          <View style={styles.colorGrid}>
            {habitColors.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorItem,
                  { backgroundColor: color },
                  selectedColor === color && { borderColor: colors.textPrimary },
                ]}
                onPress={() => setSelectedColor(color)}
                accessibilityLabel={`색상 ${color}`}
                accessibilityRole="button"
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>알림</Text>
          <TimePicker value={reminderTime} onChange={setReminderTime} />
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
    color: habitColors[0],
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
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: 12,
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
  },
});
