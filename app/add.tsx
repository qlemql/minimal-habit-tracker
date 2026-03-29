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
import { TimePicker } from '@/components/TimePicker';
import { scheduleHabitReminder } from '@/utils/notifications';
import { colors, fontSize, spacing, habitIcons, habitColors } from '@/constants/theme';

export default function AddHabitScreen() {
  const router = useRouter();
  const { addHabit } = useHabitStore();

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

    // 알림 설정
    if (reminderTime) {
      await scheduleHabitReminder(newId, trimmed, reminderTime);
      await useHabitStore.getState().updateHabit(newId, { reminderTime });
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>취소</Text>
        </Pressable>
        <Text style={styles.headerTitle}>습관 추가</Text>
        <Pressable onPress={handleSave}>
          <Text style={[styles.save, !name.trim() && styles.saveDisabled]}>
            저장
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 미리보기 */}
        <View style={styles.preview}>
          <View
            style={[
              styles.previewIcon,
              { backgroundColor: selectedColor + '20' },
            ]}
          >
            <Text style={styles.previewIconText}>{selectedIcon}</Text>
          </View>
          <Text style={styles.previewName}>
            {name.trim() || '습관 이름'}
          </Text>
        </View>

        {/* 이름 입력 */}
        <View style={styles.section}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="예: 물 2L 마시기"
            placeholderTextColor={colors.textMuted}
            maxLength={30}
            autoFocus
          />
        </View>

        {/* 아이콘 선택 */}
        <View style={styles.section}>
          <Text style={styles.label}>아이콘</Text>
          <View style={styles.grid}>
            {habitIcons.map((icon) => (
              <Pressable
                key={icon}
                style={[
                  styles.gridItem,
                  selectedIcon === icon && {
                    borderColor: selectedColor,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.gridIcon}>{icon}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 색상 선택 */}
        <View style={styles.section}>
          <Text style={styles.label}>색상</Text>
          <View style={styles.colorGrid}>
            {habitColors.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorItem,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>
        {/* 알림 설정 */}
        <View style={styles.section}>
          <Text style={styles.label}>알림</Text>
          <TimePicker value={reminderTime} onChange={setReminderTime} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
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
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
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
    backgroundColor: colors.surface,
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
  colorSelected: {
    borderColor: colors.textPrimary,
  },
});
