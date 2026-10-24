import '@/i18n';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useHabitStore } from '@/store/habitStore';
import { useProStore } from '@/store/proStore';
import { usePreferences } from '@/renewal/preferences';
import { usePersistenceHealth } from '@/renewal/persistenceHealth';
import { startupCopy } from '@/renewal/startupCopy';
import { exportOriginalStorage } from '@/renewal/recoveryExport';
import { shareBackupFile } from '@/renewal/backupFile';
import { palette } from '@/renewal/ui';
import { Runtime } from '@/renewal/Runtime';

export default function RootLayout() {
  const health = usePersistenceHealth((state) => state.stores);
  const language = usePreferences((state) => state.language);
  const c = startupCopy[language] ?? startupCopy.en;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const ready = Object.values(health).every((status) => status === 'ready');
  const failed = Object.values(health).includes('error');
  const retry = async () => {
    setMessage('');
    await Promise.all([useHabitStore.persist.rehydrate(), usePreferences.persist.rehydrate(), useProStore.persist.rehydrate()]);
  };
  const exportOriginal = async () => {
    setBusy(true);
    setMessage('');
    try {
      const raw = await exportOriginalStorage();
      await shareBackupFile(raw, `ssak-recovery-${Date.now()}.json`, c.export);
      setMessage(c.exported);
    } catch { setMessage(c.exportError); }
    finally { setBusy(false); }
  };
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {ready ? (
          <>
            <Runtime />
            <Stack
              screenOptions={{ headerShown: false, contentStyle: styles.root, animation: 'fade' }}
            />
          </>
        ) : (
          <View style={styles.loading}>
            <Text style={styles.text} accessibilityRole={failed ? 'header' : undefined}>{failed ? c.title : c.loading}</Text>
            {failed && <>
              <Text style={styles.detail}>{c.detail}</Text>
              <Pressable accessibilityRole="button" disabled={busy} style={styles.action} onPress={() => { void retry(); }}>
                <Text style={styles.actionText}>{c.retry}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={busy} style={styles.action} onPress={() => { void exportOriginal(); }}>
                <Text style={styles.actionText}>{c.export}</Text>
              </Pressable>
              {message ? <Text style={styles.detail} accessibilityLiveRegion="polite">{message}</Text> : null}
            </>}
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.paper },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, gap: 18 },
  text: { color: palette.green },
  detail: { color: palette.soft, maxWidth: 420, textAlign: 'center', lineHeight: 24 },
  action: { backgroundColor: palette.green, borderRadius: 12, padding: 16, minWidth: 220, alignItems: 'center' },
  actionText: { color: palette.white },
});
