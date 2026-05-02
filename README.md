# Ssak — Minimal Habit Tracker

> Just 3 habits. 5 seconds. Miss a day? Your flow continues.  
> *Less is more. Less is kept.*

📱 **[Download (Android APK)](https://expo.dev/accounts/daniel_hyun/projects/minimal-habit-tracker/builds/18495ca6-29e3-4eaa-885f-30bd9077aa63)** · iOS coming soon  
🇰🇷 **[한국어 README](README.ko.md)**

<p align="center">
  <img src="assets/screenshots/main-screen.png" width="300" alt="Main screen" />
</p>

---

## Why I built this

Most habit apps fail in the same way. They let you add unlimited habits, demand perfect streaks, and reset you to zero the day you miss. So you stop opening the app — and the apps meant to build habits become the first thing you abandon.

Ssak takes the opposite stance. **Three habits maximum. A missed day is a comma, not a full stop. Five seconds to log everything.**

## Two design decisions that drive everything

### 1. The 3-habit cap is a feature, not a constraint

Behavioral research is consistent: people who try to build many habits at once build none. The hard cap forces the question — *which three actually matter?* You can't add a fourth without retiring an existing one.

### 2. Forgiving streaks ("Flow")

Standard streak logic resets the counter to 0 the day you miss. The psychological effect is well documented: one missed day cascades into giving up entirely.

In Ssak, missing one day is a **pause inside the flow**. Two consecutive misses start a new flow. This matches what behavioral research actually says about habit formation — single gaps barely affect long-term outcomes, but the punishment of resetting is severe enough to kill the habit anyway.

```
● ● ◌ ● ● ●
● = completed   ◌ = pause (flow continues)
```

## Features

**Core**

- Three-habit cap, by design
- One-tap check-in (open → tap → close)
- Forgiving streak system
- Long-press a card to edit name, icon, or reminder

**Native widgets**

- iOS lock-screen widgets in three styles: single line above the clock, progress ring, dot row with count
- iOS home-screen widget
- Android home-screen widget

**Polish**

- Per-habit reminders with smart default timing
- Sprout growth stages animation: seed → bud → leaf → stem → blossom → bloom
- Light, Dark, and System themes (ships with Dark as default)
- Unlock system: new icons and colors unlock as flows grow

**Privacy**

- All data stays on the device
- No server. No account. No tracking.

## What's interesting under the hood

**iOS widgets in an Expo app** are non-trivial — Expo doesn't natively support widget extensions. I solved this with [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets) and a custom config plugin (`plugins/withSharedDefaults.js`) that injects the Swift target into the iOS build.

**Shared App Group defaults** for native ↔ JS data sync, so widgets reflect state changes without IPC ceremony.

**Animated streak transitions** with `react-native-reanimated` 4 worklets running on the UI thread for 60 fps even on older devices.

## Release history

| Version | Released | Highlight |
|---------|----------|-----------|
| 1.0.3 | 2026-04-28 | Lock-screen widgets (3 styles) |
| 1.0.2 | 2026-04-27 | Sprout growth stages, brand-aligned celebration |
| 1.0.1 | 2026-04-19 | Onboarding alarm setup, simplified habit presets |
| 1.0.0 | 2026-04-12 | Public launch on Google Play |

## Stack

`React Native 0.81` · `Expo SDK 54` · `TypeScript` · `Zustand` · `AsyncStorage` · `Expo Router` · `Reanimated 4` · `@bacons/apple-targets` (iOS widgets) · `EAS Build`

## Project structure

```
app/                  Expo Router screens (index, add, edit, settings, onboarding)
src/
├── components/       UI primitives and habit cards
├── store/            Zustand stores
├── utils/            Streak calculation, date helpers
├── types/            Shared TypeScript types
└── constants/        Theme tokens, default habits
modules/
└── shared-defaults/  Native module for App Group sync
plugins/
└── withSharedDefaults.js  Custom Expo config plugin
targets/
└── HabitWidget/      Swift widget extension
```

---

Built with Claude Code as the primary dev environment.  
Author: [Hyun (qlemql)](https://github.com/qlemql) · taehyun_fe@naver.com  
Privacy: [Privacy Policy](https://qlemql.github.io/privacy-policy/minimal-habit-tracker/)
