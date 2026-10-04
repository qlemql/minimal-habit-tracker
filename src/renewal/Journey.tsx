import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { completedDays } from './domain';
import { useCopy } from './preferences';
import { Screen, Title, Body, Eyebrow, Icon, Button, s, palette, TrailArt } from './ui';
export const Journey = () => {
  const c = useCopy();
  const router = useRouter();
  const { habits, logs } = useHabitStore();
  return (
    <Screen>
      <View style={s.header}>
        <Eyebrow>{c.journey}</Eyebrow>
        <Title>{c.pageJourney}</Title>
        <Body>{c.journeySub}</Body>
      </View>
      {[false, true].map((graduated) => (
        <View key={String(graduated)} style={s.section}>
          <Eyebrow>{graduated ? c.graduated : c.practicing}</Eyebrow>
          <View style={s.gap}>
            {habits
              .filter((habit) => Boolean(habit.isGraduated) === graduated)
              .map((habit) => (
                <Pressable
                  key={habit.id}
                  accessibilityRole="button"
                  accessibilityLabel={habit.name}
                  onPress={() => router.push({ pathname: '/practice', params: { id: habit.id } })}
                  style={({ pressed }) => [s.card, pressed && s.pressed]}
                >
                  <View style={s.between}>
                    <View style={[s.row, s.flex]}>
                      <View style={s.iconBox}>
                        <Text style={st.emoji}>{habit.icon}</Text>
                      </View>
                      <View style={s.flex}>
                        <Text style={s.cardTitle}>{habit.name}</Text>
                        <Text style={s.small}>{habit.minimum ?? habit.name}</Text>
                      </View>
                    </View>
                    <Icon name="arrow" />
                  </View>
                  <View style={s.between}>
                    <Text style={s.small}>
                      {c.total}: {completedDays(habit.id, logs).size || habit.totalFlowDays || 0}
                    </Text>
                    {graduated ? (
                      <View style={s.pill}>
                        <Text style={s.pillText}>{habit.graduatedAt}</Text>
                      </View>
                    ) : (
                      <Text style={s.small}>
                        {habit.weeklyTarget ?? 7} {c.days} / 7
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            {!habits.some((habit) => Boolean(habit.isGraduated) === graduated) && (
              <View style={s.panel}>
                {graduated ? (
                  <>
                    <TrailArt small />
                    <Text style={s.cardTitle}>{c.archiveEmpty}</Text>
                    <Body>{c.archiveSub}</Body>
                  </>
                ) : (
                  <>
                    <Body>{c.emptySub}</Body>
                    <Button onPress={() => router.push('/add')} icon="plus">
                      {c.add}
                    </Button>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      ))}
    </Screen>
  );
};
const st = StyleSheet.create({ emoji: { fontSize: 25 } });
