import { ReactNode, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { hapticImpact, hapticSelection, ImpactFeedbackStyle } from '@/utils/haptics';
import { useThemeStore } from '@/store/themeStore';
import { fontSize, spacing } from '@/constants/theme';

const ITEM_HEIGHT = 44; // pickerItem 명시 height와 동일

interface TimePickerProps {
  value: string | null;
  onChange: (time: string | null) => void;
  /** 커스텀 트리거 렌더. 지정 시 기본 트리거 대신 사용 */
  renderTrigger?: (opts: { value: string | null; open: () => void }) => ReactNode;
  /** 시간 제거("알림 끄기") 버튼 노출 여부 (기본 true) */
  allowClear?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
);
const MINUTES = ['00', '15', '30', '45'];

export function TimePicker({ value, onChange, renderTrigger, allowClear = true }: TimePickerProps) {
  const { t } = useTranslation();
  const colors = useThemeStore((s) => s.getColors());
  const [visible, setVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(
    value ? value.split(':')[0] : '09'
  );
  const [selectedMinute, setSelectedMinute] = useState(
    value ? value.split(':')[1] : '00'
  );
  const hourScrollRef = useRef<ScrollView>(null);

  // Backdrop fade + sheet slide 분리 (Modal animationType=none + Reanimated)
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(600);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 180 });
      sheetTranslateY.value = withTiming(0, { duration: 220 });
      const h = value ? value.split(':')[0] : '09';
      const m = value ? value.split(':')[1] : '00';
      setSelectedHour(h);
      setSelectedMinute(m);
      const hourIndex = parseInt(h, 10);
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({ y: hourIndex * ITEM_HEIGHT, animated: false });
      }, 50);
    } else {
      backdropOpacity.value = withTiming(0, { duration: 150 });
      sheetTranslateY.value = withTiming(600, { duration: 180 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const handleConfirm = () => {
    hapticImpact(ImpactFeedbackStyle.Light);
    onChange(`${selectedHour}:${selectedMinute}`);
    close();
  };

  const handleClear = () => {
    hapticImpact(ImpactFeedbackStyle.Light);
    onChange(null);
    close();
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ value, open })
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.trigger,
            { backgroundColor: colors.surface },
            pressed && { opacity: 0.7 },
          ]}
          onPress={open}
          accessibilityLabel={value ? t('components.timePicker.a11y.set', { time: value }) : t('components.timePicker.a11y.unset')}
          accessibilityRole="button"
        >
          <Text style={styles.triggerIcon}>{value ? '🔔' : '🔕'}</Text>
          <Text style={[styles.triggerText, { color: value ? colors.textPrimary : colors.textMuted }]}>
            {value ? t('components.timePicker.daily', { time: value }) : t('components.timePicker.none')}
          </Text>
          <Text style={[styles.triggerArrow, { color: colors.textMuted }]}>›</Text>
        </Pressable>
      )}

      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        <View style={styles.overlayContainer}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          <Animated.View style={[styles.modal, { backgroundColor: colors.surface }, sheetStyle]}>
            <View style={[styles.handle, { backgroundColor: colors.inactive }]} />
            <View style={styles.modalHeader}>
              <Pressable onPress={close} hitSlop={12}>
                <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>{t('components.timePicker.cancel')}</Text>
              </Pressable>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('components.timePicker.modalTitle')}</Text>
              <Pressable onPress={handleConfirm} hitSlop={12}>
                <Text style={[styles.modalDone, { color: colors.accent }]}>{t('components.timePicker.done')}</Text>
              </Pressable>
            </View>

            <View style={styles.pickerRow}>
              <ScrollView
                ref={hourScrollRef}
                style={styles.pickerColumn}
                showsVerticalScrollIndicator={false}
              >
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
                      {t('components.timePicker.hour', { hour: h })}
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
                      {t('components.timePicker.minute', { minute: m })}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {value && allowClear && (
              <Pressable
                style={[styles.clearButton, { backgroundColor: colors.danger + '15' }]}
                onPress={handleClear}
              >
                <Text style={[styles.clearText, { color: colors.danger }]}>{t('components.timePicker.clear')}</Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
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
  overlayContainer: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
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
  pickerItem: { height: ITEM_HEIGHT, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: 10 },
  pickerText: { fontSize: fontSize.md },
  clearButton: { marginHorizontal: spacing.lg, alignItems: 'center', padding: spacing.md, borderRadius: 14 },
  clearText: { fontSize: fontSize.md, fontWeight: '600' },
});
