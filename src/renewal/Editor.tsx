import { useState } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { LocalizedText as Text } from './LocalizedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { useProStore } from '@/store/proStore';
import { requestNotificationPermission } from '@/utils/notifications';
import { useCopy, usePreferences } from './preferences';
import { Discovery } from './Discovery';
import { discoveryCopy } from './ideas';
import { releaseCopy } from './releaseCopy';
import { Screen, Title, Body, Button, TextButton, Field, Notice, s, palette } from './ui';

export const Editor = () => {
  const c = useCopy();
  const language = usePreferences((state) => state.language);
  const d = discoveryCopy[language];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [stage, setStage] = useState<'choose' | 'plan'>(id ? 'plan' : 'choose');
  const { habits, addHabit, updateHabit } = useHabitStore();
  const pro = useProStore((state) => state.isPro);
  const habit = habits.find((item) => item.id === id);
  const [name, setName] = useState(habit?.name ?? '');
  const [cue, setCue] = useState(habit?.cue ?? '');
  const [minimum, setMinimum] = useState(habit?.minimum ?? '');
  const [icon, setIcon] = useState(habit?.icon ?? '✨');
  const [target, setTarget] = useState(habit?.weeklyTarget ?? 5);
  const [time, setTime] = useState(habit?.reminderTime ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const activeCount = habits.filter((item) => !item.isGraduated).length;
  const max = pro ? 3 : 1;
  const readOnly = Boolean(habit && !useHabitStore.getState().canTrackHabit(habit.id));
  const save = async () => {
    if (busy) return;
    if (!name.trim() || !cue.trim() || !minimum.trim()) {
      setError(c.invalid);
      return;
    }
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setError(c.invalidTime);
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (time && Platform.OS !== 'web' && !(await requestNotificationPermission())) {
        setError(c.permission);
        return;
      }
      const details = {
        cue: cue.trim(),
        minimum: minimum.trim(),
        weeklyTarget: target,
        icon,
        name: name.trim(),
        reminderTime: time || null,
      };
      if (habit) await updateHabit(habit.id, details);
      else {
        const newId = addHabit(name, icon, palette.green, {
          cue: details.cue,
          minimum: details.minimum,
          weeklyTarget: target,
        });
        if (!newId) {
          router.push('/plus');
          return;
        }
        try {
          if (time) await updateHabit(newId, { reminderTime: time });
        } catch (failure) {
          useHabitStore.getState().deleteHabit(newId);
          throw failure;
        }
      }
      usePreferences.getState().welcome();
      router.replace('/');
    } catch {
      setError(c.permission);
    } finally {
      setBusy(false);
    }
  };
  if (id && !habit)
    return (
      <Screen detail>
        <Notice>{c.notFound}</Notice>
      </Screen>
    );
  if (readOnly) return <Screen detail><Notice>{releaseCopy[language].readOnly}</Notice></Screen>;
  if (!id && activeCount >= max)
    return (
      <Screen detail>
        <View style={st.form}>
          <Title>{c.plusTitle}</Title>
          <Body>{c.plusSub}</Body>
          {max === 3 ? (
            <Notice>
              {c.noRush} · {activeCount}/3
            </Notice>
          ) : (
            <Button onPress={() => router.replace('/plus')} icon="spark">
              {c.plusCta}
            </Button>
          )}
        </View>
      </Screen>
    );
  if (!id && stage === 'choose')
    return (
      <Screen detail key="choose">
        <Discovery
          hasDraft={Boolean(name || cue || minimum)}
          onOwn={() => setStage('plan')}
          onChoose={(idea) => {
            setName(idea.name);
            setCue(idea.cue);
            setMinimum(idea.minimum);
            setIcon(idea.icon);
            setError('');
            setStage('plan');
          }}
        />
      </Screen>
    );
  return (
    <Screen detail key="plan">
      <View style={st.form}>
        <View style={s.header}>
          <Title>{id ? c.editTitle : c.createTitle}</Title>
          <Body>{c.createSub}</Body>
        </View>
        {!id && (
          <TextButton onPress={() => setStage('choose')}>
            {d.change}
          </TextButton>
        )}
        <Field
          label={c.nameLabel}
          placeholder={c.namePlaceholder}
          value={name}
          onChangeText={setName}
          maxLength={80}
          autoFocus={Boolean(id)}
        />
        <Field
          label={c.cueField}
          placeholder={c.cuePlaceholder}
          value={cue}
          onChangeText={setCue}
          maxLength={120}
        />
          <Field
            label={c.minimumField}
            placeholder={c.minimumPlaceholder}
            value={minimum}
            onChangeText={setMinimum}
            maxLength={120}
          />
        <View style={s.gap}>
          <Text style={s.fieldLabel}>{c.frequency}</Text>
          <View style={st.frequency}>
            {[3, 5, 7].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ checked: target === value }}
                accessibilityLabel={`${value} ${c.days}`}
                onPress={() => setTarget(value)}
                style={[st.frequencyOption, target === value && st.frequencySelected]}
              >
                <Text style={[st.frequencyText, target === value && st.frequencyTextSelected]}>
                  {value} {c.days}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.small}>{c.frequencyHint}</Text>
        </View>
        {Platform.OS === 'web' ? (
          <Text style={s.small}>{c.webReminder}</Text>
        ) : (
          <View style={s.gapSmall}>
            <Field
              label={c.reminder}
              placeholder="09:00"
              value={time}
              onChangeText={setTime}
              maxLength={5}
              keyboardType="numbers-and-punctuation"
            />
            <Text style={s.small}>{c.reminderHint}</Text>
            <Text style={s.small}>{releaseCopy[language].reminderNote}</Text>
          </View>
        )}
        {error ? <Notice error>{error}</Notice> : null}
        <Button
          onPress={() => {
            void save();
          }}
          disabled={busy}
          icon="arrow"
        >
          {id ? c.saveChanges : c.save}
        </Button>
      </View>
    </Screen>
  );
};
const st = StyleSheet.create({
  form: { maxWidth: 580, width: '100%', alignSelf: 'center', gap: 20 },
  frequency: { flexDirection: 'row', gap: 10 },
  frequencyOption: {
    flex: 1,
    minHeight: 50,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
    borderRadius: 12,
    alignItems: 'center',
  },
  frequencySelected: { backgroundColor: palette.pale, borderColor: palette.green },
  frequencyText: { color: palette.green, fontSize: 14 },
  frequencyTextSelected: { color: palette.green, fontWeight: '700' },
});
