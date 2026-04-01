import { useEffect } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '@/store/themeStore';
import { fontSize, spacing } from '@/constants/theme';

interface HabitCardProps {
  name: string;
  icon: string;
  color: string;
  completed: boolean;
  streak: number;
  onToggle: () => void;
  onEdit?: () => void;
}

export function HabitCard({
  name,
  icon,
  color,
  completed,
  streak,
  onToggle,
  onEdit,
}: HabitCardProps) {
  const colors = useThemeStore((s) => s.getColors());
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    checkScale.value = withSpring(completed ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
  }, [completed]);

  const handleToggle = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );

    if (!completed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onToggle();
  };

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        completed && { borderColor: color, borderWidth: 1.5 },
        cardAnimStyle,
      ]}
    >
      <Pressable style={styles.left} onPress={handleToggle}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.textPrimary }, completed && styles.nameCompleted]}>
            {name}
          </Text>
          {streak > 0 && (
            <Text style={[styles.streak, { color }]}>
              🔥 {streak}일 연속
            </Text>
          )}
        </View>
      </Pressable>
      <View style={styles.right}>
        <Pressable onPress={handleToggle} style={styles.checkboxTouchArea}>
          <View
            style={[
              styles.checkbox,
              completed
                ? { backgroundColor: color }
                : { borderColor: colors.textMuted, borderWidth: 2 },
            ]}
          >
            <Animated.Text style={[styles.checkmark, checkAnimStyle]}>
              ✓
            </Animated.Text>
          </View>
        </Pressable>
        {onEdit && (
          <Pressable onPress={onEdit} style={styles.editButton}>
            <Text style={[styles.editIcon, { color: colors.textMuted }]}>›</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  info: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  nameCompleted: {
    opacity: 0.6,
  },
  streak: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkboxTouchArea: {
    padding: spacing.xs,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  editButton: {
    padding: spacing.xs,
  },
  editIcon: {
    fontSize: fontSize.xl,
  },
});
