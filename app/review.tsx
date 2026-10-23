import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LocalizedText as Text } from '@/renewal/LocalizedText';
import { useHabitStore } from '@/store/habitStore';
import { useProStore } from '@/store/proStore';
import { useCopy, usePreferences } from '@/renewal/preferences';
import { previousWeekSummary } from '@/renewal/domain';
import { releaseCopy } from '@/renewal/releaseCopy';
import { reviewCopy } from '@/renewal/reviewCopy';
import { Screen, Title, Body, Eyebrow, Button, TextButton, Field, Notice, useToday, s, palette } from '@/renewal/ui';

export default function Review() {
  const c = useCopy();
  const language = usePreferences((state) => state.language);
  const r = reviewCopy[language];
  useProStore((state) => state.isPro);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, logs, reviewHabit } = useHabitStore();
  const habit = habits.find((item) => item.id === id);
  const [editing, setEditing] = useState(false);
  const [minimum, setMinimum] = useState(habit?.minimum ?? habit?.name ?? '');
  const [cue, setCue] = useState(habit?.cue ?? '');
  const [target, setTarget] = useState(habit?.weeklyTarget ?? 7);
  const [message, setMessage] = useState('');
  const today = useToday();
  if (!habit || habit.isGraduated)
    return <Screen detail><Notice>{c.notFound}</Notice></Screen>;
  if (!useHabitStore.getState().canTrackHabit(id))
    return <Screen detail><Notice>{releaseCopy[language].readOnly}</Notice></Screen>;

  const summary = previousWeekSummary(id, logs, today);
  const locale = language === 'en' ? 'en-US' : language;
  const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const resetDraft = () => {
    setMinimum(habit.minimum ?? habit.name);
    setCue(habit.cue ?? '');
    setTarget(habit.weeklyTarget ?? 7);
  };
  const keep = () => {
    reviewHabit(id, { feeling: 'easy', note: '', minimum: habit.minimum ?? habit.name });
    setMessage(r.kept);
  };
  const save = () => {
    if (!minimum.trim() || !cue.trim()) return;
    reviewHabit(id, { feeling: 'adjust', note: '', minimum, cue, weeklyTarget: target });
    setEditing(false);
    setMessage(r.saved);
  };

  return (
    <Screen detail>
      <View style={st.content}>
        <View style={s.header}>
          <Eyebrow>{habit.name}</Eyebrow>
          <Title>{r.title}</Title>
          <Body>{r.subtitle}</Body>
        </View>
        <View style={s.card} testID="review-week-summary">
          <Text style={s.small}>{r.lastWeek} · {formatDate(summary.start)} – {formatDate(summary.end)}</Text>
          <Text style={st.count}>{r.count(summary.total)}</Text>
          {summary.total ? <Text style={s.small}>{r.breakdown(summary.full, summary.tiny)}</Text> : <Body>{r.empty}</Body>}
        </View>
        <Body>{r.prompt}</Body>
        {editing ? (
          <View style={s.gap}>
            <Field label={c.minimumField} value={minimum} onChangeText={setMinimum} maxLength={120} />
            <Field label={c.cueField} value={cue} onChangeText={setCue} maxLength={120} />
            <Text style={s.fieldLabel}>{c.frequency}</Text>
            <View style={st.frequency}>
              {[...new Set([3, 5, 7, target])].sort((a, b) => a - b).map((value) => (
                <Pressable key={value} accessibilityRole="radio"
                  accessibilityState={{ checked: target === value }} accessibilityLabel={`${value} ${c.days}`}
                  onPress={() => setTarget(value)} style={[st.option, target === value && st.selected]}>
                  <Text style={st.optionText}>{value} {c.days}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.small}>{r.history}</Text>
            <Button onPress={save} disabled={!minimum.trim() || !cue.trim()}>{c.saveChanges}</Button>
            <TextButton onPress={() => { resetDraft(); setEditing(false); }}>{c.cancel}</TextButton>
          </View>
        ) : (
          <View style={s.gap}>
            <Button onPress={keep} disabled={Boolean(message)}>{r.keep}</Button>
            <Button secondary onPress={() => { resetDraft(); setMessage(''); setEditing(true); }}>{r.adjust}</Button>
          </View>
        )}
        {message ? <Notice>{message}</Notice> : null}
        <TextButton onPress={() => router.replace({ pathname: '/practice', params: { id } })}>{c.details}</TextButton>
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  content: { maxWidth: 580, width: '100%', alignSelf: 'center', gap: 22 },
  count: { fontSize: 22, fontWeight: '500', color: palette.ink },
  frequency: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: { flexGrow: 1, minHeight: 48, padding: 14, borderWidth: 1, borderColor: palette.line,
    backgroundColor: palette.white, borderRadius: 12, alignItems: 'center' },
  selected: { backgroundColor: palette.pale, borderColor: palette.green },
  optionText: { color: palette.green, fontSize: 14 },
});
