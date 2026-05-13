import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { hapticImpact, ImpactFeedbackStyle } from '@/utils/haptics';
import { useHabitStore } from '@/store/habitStore';
import { useThemeStore } from '@/store/themeStore';
import { getToday } from '@/utils/date';
import { fontSize, spacing } from '@/constants/theme';

interface DayDetailSheetProps {
  date: string | null;
  onClose: () => void;
}

export function DayDetailSheet({ date, onClose }: DayDetailSheetProps) {
  const { t } = useTranslation();
  const colors = useThemeStore((s) => s.getColors());
  const { habits, toggleHabit, isHabitCompleted } = useHabitStore();

  if (!date) return null;

  const isEditable = date === getToday();
  const dateObj = new Date(date + 'T00:00:00');
  const dayIndex = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
  const dayLabel = t(`days.short.${dayIndex}` as const);
  const dayNum = dateObj.getDate();

  return (
    <Modal visible={!!date} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: colors.inactive }]} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t('components.dayDetail.title', { dayLabel, dayNum })}
          </Text>
          {!isEditable && (
            <View style={[styles.readOnlyBanner, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.readOnlyText, { color: colors.textMuted }]}>
                {t('components.dayDetail.pastNotice')}
              </Text>
            </View>
          )}

          {habits.filter((h) => !h.isGraduated).map((habit) => {
            const completed = isHabitCompleted(habit.id, date);
            return (
              <Pressable
                key={habit.id}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: colors.background },
                  completed && { borderColor: habit.color + '40', borderWidth: 1 },
                  !isEditable && { opacity: 0.6 },
                  pressed && isEditable && { opacity: 0.7 },
                ]}
                onPress={() => {
                  if (!isEditable) return;
                  hapticImpact(ImpactFeedbackStyle.Light);
                  toggleHabit(habit.id, date);
                }}
                disabled={!isEditable}
              >
                <View style={[styles.icon, { backgroundColor: habit.color + '20' }]}>
                  <Text style={styles.iconText}>{habit.icon}</Text>
                </View>
                <Text
                  style={[styles.name, { color: colors.textPrimary }, completed && { opacity: 0.6 }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {habit.name}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    completed
                      ? { backgroundColor: habit.color }
                      : { borderColor: colors.inactive, borderWidth: 2 },
                    !isEditable && !completed && { opacity: 0.4 },
                  ]}
                >
                  {completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </Pressable>
            );
          })}

          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: colors.background },
              pressed && { opacity: 0.7 },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>{t('components.dayDetail.close')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: spacing.xxl },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  title: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.sm },
  readOnlyBanner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  readOnlyText: { fontSize: fontSize.xs, textAlign: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: 14, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'transparent',
  },
  icon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 20 },
  name: { flex: 1, marginLeft: spacing.md, fontSize: fontSize.md, fontWeight: '500' },
  checkbox: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  closeButton: { marginTop: spacing.md, alignItems: 'center', padding: spacing.md, borderRadius: 14 },
  closeText: { fontSize: fontSize.md, fontWeight: '500' },
});
