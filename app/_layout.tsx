import '@/i18n';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useHabitStore } from '@/store/habitStore';
import { useProStore } from '@/store/proStore';
import { usePreferences, useCopy } from '@/renewal/preferences';
import { palette } from '@/renewal/ui';
import { Runtime } from '@/renewal/Runtime';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const c = useCopy();
  useEffect(() => {
    const stores = [useHabitStore.persist, usePreferences.persist, useProStore.persist];
    const update = () => setReady(stores.every((store) => store.hasHydrated()));
    const unsubscribers = stores.map((store) => store.onFinishHydration(update));
    update();
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);
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
            <Text style={styles.text}>{c.loading}</Text>
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.paper },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: palette.green },
});
