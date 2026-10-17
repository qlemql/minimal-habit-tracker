import { useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { LocalizedText as Text } from './LocalizedText';
import { useHabitStore } from '@/store/habitStore';
import { useProStore } from '@/store/proStore';
import { cancelHabitReminder, refreshHabitReminders } from '@/utils/notifications';
import { useCopy, usePreferences } from './preferences';
import { serializeBackup } from './domain';
import { backupCopy } from './backupCopy';
import { backupFileName, previewBackup, type BackupPreview } from './backupPreview';
import { pickBackupFile, saveBackupFile, shareBackupFile } from './backupFile';
import { restoreBackup } from './restoreBackup';
import { Body, Button, Field, Icon, Notice, TextButton, s } from './ui';

export const BackupPanel = () => {
  const c = useCopy();
  const language = usePreferences((state) => state.language);
  const b = backupCopy[language];
  const router = useRouter();
  const [textMode, setTextMode] = useState(false);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const allowed = () => {
    if (useProStore.getState().isPro) return true;
    router.push('/plus');
    return false;
  };
  const run = async (action: () => Promise<void>, fallback: string) => {
    if (running.current || !allowed()) return;
    running.current = true;
    setBusy(true);
    setError(false);
    setMessage('');
    try { await action(); }
    catch (failure) {
      setError(true);
      setMessage(failure instanceof Error && failure.message === 'backup-too-large' ? b.tooLarge : fallback);
    } finally { running.current = false; setBusy(false); }
  };
  const exportFile = (share: boolean) => run(async () => {
    const { habits, logs } = useHabitStore.getState();
    const result = await (share ? shareBackupFile : saveBackupFile)(
      serializeBackup(habits, logs), backupFileName(), b.share,
    );
    if (result !== 'cancelled') setMessage(result === 'saved' ? b.saved : result === 'downloaded' ? b.downloaded : b.shared);
  }, b.exportError);
  const selectFile = () => run(async () => {
    setPreview(null);
    const file = await pickBackupFile();
    if (file) {
      setPreview(previewBackup(file.text, file.name));
      setTextMode(false);
      setText('');
    }
  }, b.importError);
  const confirmRestore = () => run(async () => {
    if (!preview) return;
    // Data was validated before preview. Recheck entitlement at the actual commit point.
    if (!useProStore.getState().isPro) return;
    const oldHabits = useHabitStore.getState().habits;
    await restoreBackup(preview.data);
    await Promise.all(oldHabits.map((habit) => cancelHabitReminder(habit.id).catch(() => {})));
    usePreferences.getState().setExample(false);
    setPreview(null);
    setText('');
    setTextMode(false);
    setMessage(c.restored);
    void refreshHabitReminders().catch(() => {});
  }, b.restoreError);

  return <View style={s.card}>
    <View style={s.row}><Icon name="download" /><Text style={s.cardTitle}>{c.backup}</Text></View>
    <Body>{b.description}</Body>
    <Button secondary disabled={busy} onPress={() => { void exportFile(false); }}>{b.save}</Button>
    {Platform.OS === 'android' && <Button secondary disabled={busy} onPress={() => { void exportFile(true); }}>{b.share}</Button>}
    <Button secondary disabled={busy} onPress={() => { void selectFile(); }}>{b.importFile}</Button>
    <Body>{b.privacy}</Body>
    {!busy && <>
      <TextButton onPress={() => { void run(async () => {
        const { habits, logs } = useHabitStore.getState();
        if (!await Clipboard.setStringAsync(serializeBackup(habits, logs))) throw new Error('clipboard');
        setMessage(c.copied);
      }, c.clipboardError); }}>{c.export}</TextButton>
      <TextButton onPress={() => {
        if (!allowed()) return;
        setTextMode(!textMode); setPreview(null); setMessage('');
      }}>{b.paste}</TextButton>
    </>}
    {textMode && <View style={s.gap}>
      <Field label={c.restore} placeholder={c.backupPlaceholder} value={text}
        onChangeText={(value) => { setText(value); setPreview(null); }}
        editable={!busy} multiline maxLength={10000000} />
      <Button secondary disabled={busy || !text.trim()} onPress={() => { void run(async () => {
        setPreview(null); setPreview(previewBackup(text, b.textName));
      }, c.backupError); }}>{b.preview}</Button>
    </View>}
    {preview && <View style={s.panel} testID="backup-preview">
      <Text style={s.cardTitle}>{b.previewTitle}</Text>
      <Text style={s.small}>{preview.name}</Text>
      <Body>{b.date}: {preview.exportedAt ? new Date(preview.exportedAt).toLocaleString(language) : b.unknownDate}</Body>
      <Body>{b.habits}: {preview.data.habits.length} · {b.logs}: {preview.data.logs.length}</Body>
      <Notice>{c.backupWarning}</Notice>
      <Button disabled={busy} onPress={() => { void confirmRestore(); }}>{c.restoreConfirm}</Button>
      {!busy && <TextButton onPress={() => { setPreview(null); setMessage(''); }}>{b.cancel}</TextButton>}
    </View>}
    {message ? <Notice error={error}>{message}</Notice> : null}
  </View>;
};
