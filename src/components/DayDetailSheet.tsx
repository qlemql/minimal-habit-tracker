import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useHabitStore } from '@/store/habitStore';
import { useThemeStore } from '@/store/themeStore';
import { DAY_LABELS, getToday } from '@/utils/date';
import { fontSize, spacing } from '@/constants/theme';

interface DayDetailSheetProps {
  date: string | null; // YYYY-MM-DD
  onClose: () => void;
}

export function DayDetailSheet({ date, onClose }: DayDetailSheetProps) {
  const colors = useThemeStore((s) => s.getColors());
  const { habits, toggleHabit, isHabitCompleted } = useHabitStore();

  if (!date) return null;

  const isEditable = date === getToday();
  const dateObj = new Date(date + 'T00:00:00');
  const dayIndex = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
  const dayLabel = DAY_LABELS[dayIndex];
  const dayNum = dateObj.getDate();

  return (
    <Modal visible={!!date} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {dayLabel}요일 {dayNum}일
          </Text>

          {habits.map((habit) => {
            const completed = isHabitCompleted(habit.id, date);
            return (
              <Pressable
                key={habit.id}
                style={[styles.row, completed && { borderColor: habit.color, borderWidth: 1 }]}
                onPress={() => isEditable && toggleHabit(habit.id, date)}
                disabled={!isEditable}
                accessibilityLabel={`${habit.name} ${completed ? '완료 취소' : '완료 체크'}`}
                accessibilityRole="checkbox"
              >
                <View style={[styles.icon, { backgroundColor: habit.color + '20' }]}>
                  <Text style={styles.iconText}>{habit.icon}</Text>
                </View>
                <Text style={[styles.name, { color: colors.textPrimary }, completed && { opacity: 0.6 }]}>
                  {habit.name}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    completed
                      ? { backgroundColor: habit.color }
                      : { borderColor: colors.textMuted, borderWidth: 2 },
                  ]}
                >
                  {completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </Pressable>
            );
          })}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>닫기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, paddingBottom: spacing.xxl },
  handle: { width: 40, height: 4, backgroundColor: '#666', borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  title: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.lg },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: 12, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'transparent',
  },
  icon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 20 },
  name: { flex: 1, marginLeft: spacing.md, fontSize: fontSize.md, fontWeight: '500' },
  checkbox: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  checkmark: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  closeButton: { marginTop: spacing.md, alignItems: 'center', padding: spacing.md },
  closeText: { fontSize: fontSize.md },
});
