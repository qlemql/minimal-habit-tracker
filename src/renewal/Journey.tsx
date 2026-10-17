import { View, Pressable, StyleSheet } from 'react-native';
import { LocalizedText as Text } from './LocalizedText';
import { useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { completedDays } from './domain';
import { useCopy, usePreferences } from './preferences';
import { useProStore } from '@/store/proStore';
import { trackableHabits } from './access';
import { releaseCopy } from './releaseCopy';
import { Screen, Title, Body, Eyebrow, Icon, Button, TextButton, s, palette } from './ui';
export const Journey = () => {
  const c = useCopy();
  const router = useRouter();
  const { habits, logs, freeHabitId } = useHabitStore();
  const pro = useProStore((state) => state.isPro);
  const language = usePreferences((state) => state.language);
  const r = releaseCopy[language];
  const trackable = new Set(trackableHabits(habits, pro, freeHabitId).map((habit) => habit.id));
  const hasReadOnly = habits.some((habit) => !habit.isGraduated && !trackable.has(habit.id));
  return (
    <Screen>
      <View style={s.header}>
        <Title>{c.pageJourney}</Title>
        <Body>{c.journeySub}</Body>
      </View>
      {hasReadOnly && <View style={s.panel}>
        <Body>{r.readOnlyListNote}</Body>
        <TextButton onPress={() => router.push('/settings')}>{r.changeHabit}</TextButton>
      </View>}
      {[false, true].map((graduated) => (
        <View key={String(graduated)} style={s.section}>
          <Eyebrow>{graduated ? c.graduated : c.practicing}</Eyebrow>
          <View style={s.gap}>
            {habits
              .filter((habit) => Boolean(habit.isGraduated) === graduated)
              .map((habit) => {
                const readOnly = !graduated && !trackable.has(habit.id);
                const status = readOnly ? r.readOnlyLabel : r.trackableLabel;
                return (
                  <View key={habit.id} style={s.gapSmall}>
                  <Pressable
                    accessibilityRole="button"
                    testID={`journey-habit-${habit.id}`}
                    accessibilityLabel={!graduated && hasReadOnly ? `${habit.name} · ${status}` : habit.name}
                    onPress={() => router.push({ pathname: '/practice', params: { id: habit.id } })}
                    style={({ pressed }) => [graduated ? st.archiveRow : s.card, readOnly && st.readOnlyCard, pressed && s.pressed]}
                  >
                    {!graduated && hasReadOnly && <View style={[st.status, readOnly ? st.readOnlyStatus : st.trackableStatus]}>
                      <Icon name={readOnly ? 'lock' : 'check'} size={15} color={readOnly ? palette.muted : palette.green} />
                      <Text style={[st.statusText, { color: readOnly ? palette.muted : palette.green }]}>{status}</Text>
                    </View>}
                    <View style={s.between}>
                      <View style={[s.row, s.flex]}>
                        <View style={s.iconBox}>
                          <Text style={st.emoji}>{habit.icon}</Text>
                        </View>
                        <View style={s.flex}>
                          <Text style={s.cardTitle}>{habit.name}</Text>
                          <Text style={s.small}>{habit.cue ?? c.cueLabel}</Text>
                        </View>
                      </View>
                      <Icon name="arrow" />
                    </View>
                    <View style={s.between}>
                      <View style={st.metric}>
                        <Text style={[graduated ? s.cardTitle : st.number, readOnly && st.readOnlyNumber]}>{completedDays(habit.id, logs).size || habit.totalFlowDays || 0}</Text>
                        <Text style={s.small}>{c.total}</Text>
                      </View>
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
                    {!graduated && <View style={st.minimum}>
                      <Text style={s.small}>{c.minimumLabel}</Text>
                      <Text style={s.small}>{habit.minimum ?? habit.name}</Text>
                    </View>}
                  </Pressable>
                  {!graduated && !readOnly && <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${c.review}: ${habit.name}`}
                    onPress={() => router.push({ pathname: '/review', params: { id: habit.id } })}
                    style={({ pressed }) => [st.review, pressed && s.pressed]}
                  >
                    <View style={s.flex}>
                      <Text style={s.fieldLabel}>{c.reviewTitle}</Text>
                      <Text style={s.small}>{c.review}</Text>
                    </View>
                    <Icon name="arrow" size={18} />
                  </Pressable>}
                  </View>
                );
              })}
            {!habits.some((habit) => Boolean(habit.isGraduated) === graduated) && (
              <View style={s.panel}>
                {graduated ? (
                  <>
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
const st = StyleSheet.create({
  readOnlyCard: { backgroundColor: palette.pale, borderColor: palette.line },
  readOnlyNumber: { color: palette.muted },
  status: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  readOnlyStatus: { backgroundColor: palette.line },
  trackableStatus: { backgroundColor: palette.pale },
  statusText: { fontSize: 12, fontWeight: '600', flexShrink: 1 },
  emoji: { fontSize: 25 },
  metric: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flex: 1, flexWrap: 'wrap' },
  number: { fontSize: 44, lineHeight: 52, color: palette.green, letterSpacing: -1.5 },
  archiveRow: { gap: 16, paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: palette.line },
  minimum: { borderTopWidth: 1, borderColor: palette.line, paddingTop: 15, gap: 4 },
  review: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: palette.green },
});
