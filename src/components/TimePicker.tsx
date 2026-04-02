import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { hapticImpact, hapticSelection, ImpactFeedbackStyle } from '@/utils/haptics';
import { useThemeStore } from '@/store/themeStore';
import { fontSize, spacing } from '@/constants/theme';

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
    hapticImpact(ImpactFeedbackStyle.Light);
    onChange(`${selectedHour}:${selectedMinute}`);
    setVisible(false);
  };

  const handleClear = () => {
    hapticImpact(ImpactFeedbackStyle.Light);
    onChange(null);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: colors.surface },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => setVisible(true)}
        accessibilityLabel={value ? `알림 시간 ${value}` : '알림 설정'}
        accessibilityRole="button"
      >
        <Text style={styles.triggerIcon}>{value ? '🔔' : '🔕'}</Text>
        <Text style={[styles.triggerText, { color: value ? colors.textPrimary : colors.textMuted }]}>
          {value ? `매일 ${value}` : '알림 없음'}
        </Text>
        <Text style={[styles.triggerArrow, { color: colors.textMuted }]}>›</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <View style={[styles.handle, { backgroundColor: colors.inactive }]} />
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setVisible(false)} hitSlop={12}>
                <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>취소</Text>
              </Pressable>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>알림 시간</Text>
              <Pressable onPress={handleConfirm} hitSlop={12}>
                <Text style={[styles.modalDone, { color: colors.accent }]}>완료</Text>
              </Pressable>
            </View>

            <View style={styles.pickerRow}>
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {HOURS.map((h) => (
                  <Pressable
                    key={h}
                    style={[
                      styles.pickerItem,
                      selectedHour === h && { backgroundColor: colors.accent + '20' },
                    ]}
                    onPress={() => {
                      hapticSelection();
                      setSelectedHour(h);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        { color: colors.textSecondary },
                        selectedHour === h && { color: colors.accent, fontWeight: '600' },
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
                      selectedMinute === m && { backgroundColor: colors.accent + '20' },
                    ]}
                    onPress={() => {
                      hapticSelection();
                      setSelectedMinute(m);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        { color: colors.textSecondary },
                        selectedMinute === m && { color: colors.accent, fontWeight: '600' },
                      ]}
                    >
                      {m}분
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {value && (
              <Pressable
                style={[styles.clearButton, { backgroundColor: colors.danger + '15' }]}
                onPress={handleClear}
              >
                <Text style={[styles.clearText, { color: colors.danger }]}>알림 끄기</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: spacing.md,
  },
  triggerIcon: { fontSize: 18, marginRight: spacing.sm + 2 },
  triggerText: { flex: 1, fontSize: fontSize.md },
  triggerArrow: { fontSize: 18, fontWeight: '500' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: spacing.xxl },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  modalCancel: { fontSize: fontSize.md },
  modalTitle: { fontSize: fontSize.md, fontWeight: '600' },
  modalDone: { fontSize: fontSize.md, fontWeight: '600' },
  pickerRow: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md },
  pickerColumn: { flex: 1, maxHeight: 200 },
  minuteColumn: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  pickerItem: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, borderRadius: 10 },
  pickerText: { fontSize: fontSize.md },
  clearButton: { marginHorizontal: spacing.lg, alignItems: 'center', padding: spacing.md, borderRadius: 14 },
  clearText: { fontSize: fontSize.md, fontWeight: '600' },
});
