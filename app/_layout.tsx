import '@/i18n';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Appearance } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { useThemeStore } from '@/store/themeStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useHabitStore } from '@/store/habitStore';
import {
  setupNotificationCategories,
  refreshHabitReminders,
  HABIT_TOGGLE_ACTION,
} from '@/utils/notifications';
import { syncWidgetData } from '@/utils/widgetData';
import { MilestoneChoiceDialog } from '@/components/MilestoneChoiceDialog';

export default function RootLayout() {
  const colors = useThemeStore((s) => s.getColors());
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === 'dark' || (mode === 'system' && Appearance.getColorScheme() !== 'light');
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Zustand persist 로드 대기
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 카테고리 등록은 알림이 도착하기 전에 끝나야 함 — 앱 시작 시 한 번
    setupNotificationCategories().catch(() => {});
    // 앱 launch마다 다음 N일치 reminder 보충 + reactivation 갱신
    // (7일 이상 미사용으로 모든 single-shot이 소진되었거나 일부만 남은 경우 대비)
    refreshHabitReminders().catch(() => {});

    // 잠금화면/알림센터에서 "완료" 버튼 또는 알림 탭 → 처리
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as
          | { habitId?: string; kind?: string }
          | undefined;
        const habitId = data?.habitId;
        if (!habitId) return;

        // 액션 버튼 "완료"만 토글 — 알림 본문 탭은 앱 진입(기본 동작)
        if (response.actionIdentifier === HABIT_TOGGLE_ACTION) {
          useHabitStore.getState().toggleHabit(habitId);
          syncWidgetData().catch(() => {});
          return;
        }

        // reactivation 알람을 탭해 들어온 경우 — 보충 로직은 launch effect에서
        // 이미 호출되지만, 안전을 위해 한 번 더 호출 (idempotent)
        if (data?.kind === 'reactivation') {
          refreshHabitReminders().catch(() => {});
        }
      }
    );

    // 콜드 스타트: 앱 종료 상태에서 액션을 눌렀을 경우 큐된 응답 처리
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content.data as
        | { habitId?: string; kind?: string }
        | undefined;
      const habitId = data?.habitId;
      if (!habitId) return;
      if (response.actionIdentifier === HABIT_TOGGLE_ACTION) {
        useHabitStore.getState().toggleHabit(habitId);
        syncWidgetData().catch(() => {});
      }
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === 'onboarding';

    if (!onboardingCompleted && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [ready, onboardingCompleted, segments, router]);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="add" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="edit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="stats" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      <MilestoneChoiceDialog />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
