import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LocalizedText as Text } from '@/renewal/LocalizedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { useCopy, usePreferences } from '@/renewal/preferences';
import { useProStore } from '@/store/proStore';
import { releaseCopy } from '@/renewal/releaseCopy';
import {
  Screen,
  Title,
  Body,
  Eyebrow,
  Button,
  Field,
  Icon,
  Notice,
  s,
  palette,
} from '@/renewal/ui';
import type { HabitReview } from '@/types/habit';
export default function Review() {
  const c = useCopy();
  const language = usePreferences((state) => state.language);
  useProStore((state) => state.isPro);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, reviewHabit } = useHabitStore();
  const habit = habits.find((item) => item.id === id);
  const [feeling, setFeeling] = useState<HabitReview['feeling']>('easy');
  const [minimum, setMinimum] = useState(habit?.minimum ?? habit?.name ?? '');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  if (!habit || habit.isGraduated)
    return (
      <Screen detail>
        <Notice>{c.notFound}</Notice>
      </Screen>
    );
  const options: { id: HabitReview['feeling']; title: string; sub: string }[] = [
    { id: 'easy', title: c.easy, sub: c.easySub },
    { id: 'adjust', title: c.adjust, sub: c.adjustSub },
    { id: 'ready', title: c.ready, sub: c.readySub },
  ];
  if (!useHabitStore.getState().canTrackHabit(id))
    return <Screen detail><Notice>{releaseCopy[language].readOnly}</Notice></Screen>;
  return (
    <Screen detail>
      <View style={st.content}>
        <View style={s.header}>
          <Eyebrow>{habit.name}</Eyebrow>
          <Title>{c.reflectTitle}</Title>
          <Body>{c.reflectSub}</Body>
        </View>
        {saved ? (
          <>
            <Notice>{c.saved}</Notice>
            <Button
              onPress={() => router.replace({ pathname: '/practice', params: { id } })}
              icon="arrow"
            >
              {feeling === 'ready' ? c.graduate : c.details}
            </Button>
          </>
        ) : (
          <>
            <View style={s.gap}>
              {options.map((option) => (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: feeling === option.id }}
                  accessibilityLabel={option.title}
                  onPress={() => setFeeling(option.id)}
                  style={[s.card, st.option, feeling === option.id && st.selected]}
                >
                  <View style={s.flex}>
                    <Text style={s.fieldLabel}>{option.title}</Text>
                    <Text style={s.small}>{option.sub}</Text>
                  </View>
                  <View style={[st.radio, feeling === option.id && st.radioSelected]}>
                    {feeling === option.id && <Icon name="check" size={14} color={palette.white} />}
                  </View>
                </Pressable>
              ))}
            </View>
            {feeling === 'adjust' && (
              <Field
                label={c.minimumField}
                value={minimum}
                onChangeText={setMinimum}
                maxLength={120}
              />
            )}
            <Field
              label={`${c.note} · ${c.optional}`}
              value={note}
              onChangeText={setNote}
              placeholder={c.notePlaceholder}
              multiline
              maxLength={500}
            />
            <Button
              disabled={!minimum.trim()}
              onPress={() => {
                reviewHabit(id, {
                  feeling,
                  note: note.trim(),
                  minimum: feeling === 'adjust' ? minimum : (habit.minimum ?? habit.name),
                });
                setSaved(true);
              }}
              icon="check"
            >
              {c.reflectSave}
            </Button>
          </>
        )}
      </View>
    </Screen>
  );
}
const st = StyleSheet.create({
  content: { maxWidth: 580, width: '100%', alignSelf: 'center', gap: 22 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 },
  selected: { borderColor: palette.green, backgroundColor: palette.pale },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: palette.green, borderColor: palette.green },
});
