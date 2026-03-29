import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { colors, fontSize, spacing, habitColors } from '@/constants/theme';

interface TimePickerProps {
  value: string | null; // HH:mm 또는 null
  onChange: (time: string | null) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
);
const MINUTES = ['00', '15', '30', '45'];

export function TimePicker({ value, onChange }: TimePickerProps) {
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
      <Pressable style={styles.trigger} onPress={() => setVisible(true)}>
        <Text style={styles.triggerIcon}>🔔</Text>
        <Text style={styles.triggerText}>
          {value ? `매일 ${value}` : '알림 없음'}
        </Text>
        <Text style={styles.triggerArrow}>›</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setVisible(false)}>
                <Text style={styles.modalCancel}>취소</Text>
              </Pressable>
              <Text style={styles.modalTitle}>알림 시간</Text>
              <Pressable onPress={handleConfirm}>
                <Text style={styles.modalDone}>완료</Text>
              </Pressable>
            </View>

            <View style={styles.pickerRow}>
              {/* 시간 */}
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {HOURS.map((h) => (
                  <Pressable
                    key={h}
                    style={[
                      styles.pickerItem,
                      selectedHour === h && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedHour(h)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        selectedHour === h && styles.pickerTextSelected,
                      ]}
                    >
                      {h}시
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              {/* 분 */}
              <View style={styles.minuteColumn}>
                {MINUTES.map((m) => (
                  <Pressable
                    key={m}
                    style={[
                      styles.pickerItem,
                      selectedMinute === m && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedMinute(m)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        selectedMinute === m && styles.pickerTextSelected,
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
                <Text style={styles.clearText}>알림 끄기</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  triggerIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  triggerText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  triggerArrow: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  modalCancel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  modalTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalDone: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: habitColors[0],
  },
  pickerRow: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  pickerColumn: {
    flex: 1,
    maxHeight: 200,
  },
  minuteColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pickerItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  pickerItemSelected: {
    backgroundColor: habitColors[0] + '30',
  },
  pickerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  pickerTextSelected: {
    color: habitColors[0],
    fontWeight: '600',
  },
  clearButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  clearText: {
    fontSize: fontSize.md,
    color: colors.danger,
  },
});
