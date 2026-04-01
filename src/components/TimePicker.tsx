import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { fontSize, spacing, habitColors } from '@/constants/theme';

interface TimePickerProps {
  value: string | null;
  onChange: (time: string | null) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
);
const MINUTES = ['00', '15', '30', '45'];

export function TimePicker({ value, onChange }: TimePickerProps) {
  const colors = useThemeStore((s) => s.getColors());
  const [visible, setVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(
    value ? value.split(':')[0] : '09'
  );
  const [selectedMinute, setSelectedMinute] = useState(
    value ? value.split(':')[1] : '00'
  );

  const handleConfirm = () => {
    onChange(`${selectedHour}:${selectedMinute}`);
    setVisible(false);
  };

  const handleClear = () => {
    onChange(null);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        style={[styles.trigger, { backgroundColor: colors.surface }]}
        onPress={() => setVisible(true)}
        accessibilityLabel={value ? `알림 시간 ${value}` : '알림 설정'}
        accessibilityRole="button"
      >
        <Text style={styles.triggerIcon}>🔔</Text>
        <Text style={[styles.triggerText, { color: colors.textPrimary }]}>
          {value ? `매일 ${value}` : '알림 없음'}
        </Text>
        <Text style={[styles.triggerArrow, { color: colors.textMuted }]}>›</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.surfaceLight }]}>
              <Pressable onPress={() => setVisible(false)} hitSlop={12}>
                <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>취소</Text>
              </Pressable>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>알림 시간</Text>
              <Pressable onPress={handleConfirm} hitSlop={12}>
                <Text style={styles.modalDone}>완료</Text>
              </Pressable>
            </View>

            <View style={styles.pickerRow}>
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {HOURS.map((h) => (
                  <Pressable
                    key={h}
                    style={[
                      styles.pickerItem,
                      selectedHour === h && { backgroundColor: habitColors[0] + '30' },
                    ]}
                    onPress={() => setSelectedHour(h)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        { color: colors.textSecondary },
                        selectedHour === h && { color: habitColors[0], fontWeight: '600' },
                      ]}
                    >
                      {h}시
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.minuteColumn}>
                {MINUTES.map((m) => (
                  <Pressable
                    key={m}
                    style={[
                      styles.pickerItem,
                      selectedMinute === m && { backgroundColor: habitColors[0] + '30' },
                    ]}
                    onPress={() => setSelectedMinute(m)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        { color: colors.textSecondary },
                        selectedMinute === m && { color: habitColors[0], fontWeight: '600' },
                      ]}
                    >
                      {m}분
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {value && (
              <Pressable style={styles.clearButton} onPress={handleClear}>
                <Text style={[styles.clearText, { color: colors.danger }]}>알림 끄기</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: spacing.md },
  triggerIcon: { fontSize: 18, marginRight: spacing.sm },
  triggerText: { flex: 1, fontSize: fontSize.md },
  triggerArrow: { fontSize: fontSize.lg },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: spacing.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1 },
  modalCancel: { fontSize: fontSize.md },
  modalTitle: { fontSize: fontSize.md, fontWeight: '600' },
  modalDone: { fontSize: fontSize.md, fontWeight: '600', color: habitColors[0] },
  pickerRow: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md },
  pickerColumn: { flex: 1, maxHeight: 200 },
  minuteColumn: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  pickerItem: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8 },
  pickerText: { fontSize: fontSize.sm },
  clearButton: { alignItems: 'center', padding: spacing.md },
  clearText: { fontSize: fontSize.md },
});
