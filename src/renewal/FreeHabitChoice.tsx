import { View } from 'react-native';
import { LocalizedText as Text } from './LocalizedText';
import { useHabitStore } from '@/store/habitStore';
import { useProStore } from '@/store/proStore';
import { usePreferences } from './preferences';
import { releaseCopy } from './releaseCopy';
import { Body, Button, s } from './ui';

export const FreeHabitChoice = ({ always = false }: { always?: boolean }) => {
  const { habits, legacyAccess, freeHabitId, selectFreeHabit } = useHabitStore();
  const pro = useProStore((state) => state.isPro);
  const language = usePreferences((state) => state.language);
  const c = releaseCopy[language];
  const active = habits.filter((habit) => !habit.isGraduated);
  if (pro || legacyAccess || active.length <= 1 ||
      (!always && active.some((habit) => habit.id === freeHabitId))) return null;
  return <View style={s.card}>
    <Text style={s.cardTitle}>{c.choose}</Text>
    <Body>{c.chooseSub}</Body>
    {active.map((habit) => <Button key={habit.id}
      secondary={habit.id !== freeHabitId}
      onPress={() => selectFreeHabit(habit.id)}>
      {habit.name} · {habit.id === freeHabitId ? c.selected : c.chooseAction}
    </Button>)}
  </View>;
};
