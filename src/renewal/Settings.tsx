import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LocalizedText as Text } from './LocalizedText';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { useProStore } from '@/store/proStore';
import { cancelHabitReminder, refreshHabitReminders } from '@/utils/notifications';
import { useCopy, usePreferences } from './preferences';
import { languages } from './copy';
import { FreeHabitChoice } from './FreeHabitChoice';
import { releaseCopy } from './releaseCopy';
import { serializeBackup, parseBackup } from './domain';
import { clearExample, loadExample } from './sample';
import {
  Screen,
  Title,
  Body,
  Eyebrow,
  Button,
  Field,
  TextButton,
  Notice,
  Icon,
  s,
  palette,
} from './ui';

export const Settings = () => {
  const c = useCopy();
  const router = useRouter();
  const { language, setLanguage, example } = usePreferences();
  const release = releaseCopy[language];
  const { habits, logs } = useHabitStore();
  const pro = useProStore((state) => state.isPro);
  const [restoring, setRestoring] = useState(false);
  const [backup, setBackup] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const copy = async () => {
    if (!pro) {
      router.push('/plus');
      return;
    }
    setError(false);
    try {
      const ok = await Clipboard.setStringAsync(serializeBackup(habits, logs));
      setMessage(ok ? c.copied : c.clipboardError);
    } catch {
      setError(true);
      setMessage(c.clipboardError);
    }
  };
  const restore = async () => {
    if (!pro || busy) return;
    setError(false);
    setBusy(true);
    try {
      const data = parseBackup(backup);
      // Validate the full payload before any state mutation or notification cancellation.
      if (data.habits.filter((habit) => !habit.isGraduated).length > (pro ? 3 : 1))
        throw new Error('limit');
      await Promise.all(habits.map((habit) => cancelHabitReminder(habit.id).catch(() => {})));
      useHabitStore.setState(data);
      usePreferences.getState().setExample(false);
      setBackup('');
      setRestoring(false);
      setMessage(c.restored);
      void refreshHabitReminders().catch(() => {});
    } catch (failure) {
      setError(true);
      setMessage(
        failure instanceof Error && failure.message === 'limit' ? c.backupLimit : c.backupError,
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <View style={st.content}>
        <View style={s.header}>
          <Eyebrow>{c.settings}</Eyebrow>
          <Title>{c.settingsTitle}</Title>
        </View>
        <View style={s.card}>
          <View style={s.row}>
            <Icon name="settings" />
            <Text style={s.fieldLabel}>{c.language}</Text>
          </View>
          <View style={st.languages}>
            {languages.map((item) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: language === item.code }}
                key={item.code}
                onPress={() => {
                  setLanguage(item.code);
                  setMessage('');
                }}
                style={[st.language, item.code === language && st.selected]}
              >
                <Text style={st.languageText}>{item.label}</Text>
                {item.code === language && <Icon name="check" size={15} />}
              </Pressable>
            ))}
          </View>
        </View>
        <FreeHabitChoice always />
        <View style={s.panel}>
          <View style={s.between}>
            <Text style={s.cardTitle}>{pro ? c.plusActive : c.freeStatus}</Text>
            <Icon name="spark" />
          </View>
          <Body>{pro ? c.plusText : c.freeText}</Body>
          <Button secondary onPress={() => router.push('/plus')}>
            {pro ? c.plusDetails : c.plusCta}
          </Button>
        </View>
        <View style={s.card}>
          <View style={s.row}>
            <Icon name="download" />
            <Text style={s.cardTitle}>{c.backup}</Text>
          </View>
          <Body>{c.backupSub}</Body>
          <Button
            secondary
            onPress={() => {
              void copy();
            }}
          >
            {c.export}
          </Button>
          <TextButton
            onPress={() => {
              if (!pro) router.push('/plus');
              else setRestoring(!restoring);
            }}
          >
            {c.restore}
          </TextButton>
          {restoring && (
            <View style={s.gap}>
              <Notice>{c.backupWarning}</Notice>
              <Field
                label={c.restore}
                placeholder={c.backupPlaceholder}
                value={backup}
                onChangeText={setBackup}
                multiline
                maxLength={10000000}
              />
              <Button
                disabled={!backup.trim() || busy}
                onPress={() => {
                  void restore();
                }}
              >
                {c.restoreConfirm}
              </Button>
            </View>
          )}
          {message ? <Notice error={error}>{message}</Notice> : null}
        </View>
        <View style={st.privacy}>
          <Icon name="shield" size={28} />
          <Text style={s.fieldLabel}>{c.privacy}</Text>
          <Body>{c.privacySub}</Body>
          <TextButton onPress={() => router.push('/privacy')}>{release.privacy}</TextButton>
          <TextButton onPress={() => router.push('/support')}>{release.support}</TextButton>
          <TextButton onPress={() => router.push('/terms')}>{release.terms}</TextButton>
        </View>
        {example ? (
          <TextButton
            onPress={() => {
              clearExample();
              router.replace('/');
            }}
          >
            {c.sampleClear}
          </TextButton>
        ) : (
          habits.length === 0 && (
            <TextButton
              onPress={() => {
                loadExample(c);
                router.replace('/');
              }}
            >
              {c.sample}
            </TextButton>
          )
        )}
        <Text style={st.footer}>ssak · 2.0</Text>
      </View>
    </Screen>
  );
};
const st = StyleSheet.create({
  content: { maxWidth: 650, width: '100%', alignSelf: 'center', gap: 22 },
  languages: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  language: {
    minHeight: 44,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selected: { backgroundColor: palette.pale, borderColor: palette.green },
  languageText: { fontSize: 13, color: palette.green },
  privacy: { padding: 18, gap: 12 },
  footer: { color: palette.soft, fontSize: 11, textAlign: 'center', letterSpacing: 1 },
});
