import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';

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
  return (
    <View
      style={[
        styles.card,
        completed && { borderColor: color, borderWidth: 1.5 },
      ]}
    >
      <Pressable style={styles.left} onPress={onToggle}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, completed && styles.nameCompleted]}>
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
        <Pressable onPress={onToggle} style={styles.checkboxTouchArea}>
          <View
            style={[
              styles.checkbox,
              completed
                ? { backgroundColor: color }
                : { borderColor: colors.textMuted, borderWidth: 2 },
            ]}
          >
            {completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </Pressable>
        {onEdit && (
          <Pressable onPress={onEdit} style={styles.editButton}>
            <Text style={styles.editIcon}>›</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
    color: colors.textPrimary,
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
    color: colors.textMuted,
  },
});
