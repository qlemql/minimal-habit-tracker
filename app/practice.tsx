import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { completedDays } from '@/renewal/domain';
import { useCopy, usePreferences } from '@/renewal/preferences';
import { useProStore } from '@/store/proStore';
import { releaseCopy } from '@/renewal/releaseCopy';
import {
  Screen,
  Title,
  Body,
  Eyebrow,
  Button,
  TextButton,
  Icon,
  Week,
  Notice,
  useToday,
  s,
  palette,
} from '@/renewal/ui';
export default function Practice() {
  const c = useCopy();
  const language = usePreferences((state) => state.language);
  useProStore((state) => state.isPro);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, logs, graduateHabit, restartHabit, deleteHabit } = useHabitStore();
  const habit = habits.find((item) => item.id === id);
  const [confirm, setConfirm] = useState<'graduate' | 'delete' | null>(null);
  const today = useToday();
  if (!habit)
    return (
      <Screen detail>
        <Notice>{c.notFound}</Notice>
      </Screen>
    );
  const dates = completedDays(id, logs);
  if (confirm)
    return (
      <Screen detail>
        <View style={st.content}>
          <Icon name={confirm === 'graduate' ? 'spark' : 'close'} size={36} />
          <Title>{confirm === 'graduate' ? c.graduateTitle : c.deleteTitle}</Title>
          <Body>{confirm === 'graduate' ? c.graduateSub : c.deleteSub}</Body>
          <Button
            onPress={() => {
              if (confirm === 'graduate') graduateHabit(id);
              else deleteHabit(id);
              router.replace('/stats');
            }}
          >
            {confirm === 'graduate' ? c.graduateConfirm : c.confirmDelete}
          </Button>
          <TextButton onPress={() => setConfirm(null)}>{c.cancel}</TextButton>
        </View>
      </Screen>
    );
  return (
    <Screen detail>
      <View style={st.content}>
        <View style={s.header}>
          <View style={s.iconBox}>
            <Text style={st.emoji}>{habit.icon}</Text>
          </View>
          <Eyebrow>{habit.isGraduated ? c.graduated : c.practicing}</Eyebrow>
          <Title>{habit.name}</Title>
          <Body>{habit.cue ?? c.cueLabel}</Body>
        </View>
        <View style={s.panel}>
          <Eyebrow>{c.minimumLabel}</Eyebrow>
          <Text style={s.cardTitle}>{habit.minimum ?? habit.name}</Text>
        </View>
        <View style={s.card}>
          <View style={s.between}>
            <Text style={s.fieldLabel}>{c.total}</Text>
            <Text style={st.number}>{dates.size || habit.totalFlowDays || 0}</Text>
          </View>
          <Week dates={dates} today={today} large />
          <Text style={s.small}>{c.noRush}</Text>
        </View>
        {habit.isGraduated ? (
          <>
            <Notice>
              {c.graduationNote} {habit.graduatedAt}
            </Notice>
            <Button
              onPress={() => {
                if (restartHabit(id)) router.replace('/');
                else router.push('/add');
              }}
              icon="path"
            >
              {c.restart}
            </Button>
            <Body>{c.restartSub}</Body>
          </>
        ) : !useHabitStore.getState().canTrackHabit(id) ? (
          <Notice>{releaseCopy[language].readOnly}</Notice>
        ) : (
          <>
            <Button onPress={() => router.push({ pathname: '/review', params: { id } })} icon="pen">
              {c.review}
            </Button>
            <Button secondary onPress={() => router.push({ pathname: '/edit', params: { id } })}>
              {c.edit}
            </Button>
            <TextButton onPress={() => setConfirm('graduate')}>{c.graduate}</TextButton>
          </>
        )}
        <View style={s.section}>
          <Eyebrow>{c.history}</Eyebrow>
          {habit.reviews?.length ? (
            <View style={s.gap}>
              {[...habit.reviews].reverse().map((review) => (
                <View key={review.id} style={s.card}>
                  <View style={s.between}>
                    <Text style={s.fieldLabel}>{c[review.feeling]}</Text>
                    <Text style={s.small}>{review.date}</Text>
                  </View>
                  {review.note ? <Body>{review.note}</Body> : null}
                  <Text style={s.small}>
                    {c.minimumLabel} · {review.minimum}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Body>{c.historyEmpty}</Body>
          )}
        </View>
        <TextButton danger onPress={() => setConfirm('delete')}>
          {c.delete}
        </TextButton>
      </View>
    </Screen>
  );
}
const st = StyleSheet.create({
  content: { maxWidth: 600, width: '100%', alignSelf: 'center', gap: 18 },
  emoji: { fontSize: 27 },
  number: { fontSize: 28, color: palette.green, fontWeight: '600' },
});
