# Ssak: Three Habits

**English** · [한국어](README.ko.md)

> Just 3 habits. 5 seconds a day. Miss a day? Your Flow keeps going.
> *Less is more. Less is kept.*

📱 Available on the **App Store** (iOS) · **Google Play** in preparation

---

## Why I built this

Most habit apps fail in the same way. They let you add unlimited habits, demand perfect streaks, and reset you to zero the day you miss. So you stop opening the app — and the apps meant to build habits become the first thing you abandon.

Ssak takes the opposite stance. **Three habits maximum. A missed day is a comma, not a full stop. Five seconds to log everything.**

## Two design decisions that drive everything

### 1. The 3-habit cap is a feature, not a constraint

Behavioral research is consistent: people who try to build many habits at once build none. The hard cap forces the question — *which three actually matter?* You can't add a fourth without retiring an existing one.

Empty slots are now visible on the home screen too — the constraint shows itself every day, not just when you bump into it.

### 2. Forgiving Flow

Standard streak logic resets the counter to zero the day you miss. The psychological effect is well documented: one missed day cascades into giving up entirely.

In Ssak, missing one day is a **pause inside the Flow**. Two consecutive misses start a new Flow. This matches what behavioral research actually says about habit formation — single gaps barely affect long-term outcomes, but the punishment of resetting is severe enough to kill the habit anyway.

```
● ● ◌ ● ● ●
● = completed   ◌ = pause (Flow continues)
```

## Features

**Core**

- Three-habit cap, by design (empty slots visible on home)
- One-tap check-in (open → tap → close)
- Forgiving Flow system
- Long-press a card to edit name, icon, or reminder
- Bloomed habits can graduate — early at 7 days (Leaf), auto-proposed at 50 days
- Graduation Garden + Stats screen for grown habits

**Smart reminders**

- Per-habit reminders with smart default timing
- Already done today? No reminder. (Skips today's notification on completion)
- Inactive for a week? A gentle "let's resume" reactivation notification
- Lock-screen notification action — long-press the reminder, tap *Done*

**Native widgets**

- iOS lock-screen widgets in three styles: single line above the clock, progress ring, dot row with count
- iOS home-screen widget (small / medium)
- Android home-screen widget (Kotlin RemoteViews, tap-to-check queue sync)

**Polish**

- Growth stages animation: seed → sprout → leaf → stem → bud → bloom
- Light (cream) and Dark themes
- Unlock system: new icons and colors unlock as Flows grow
- Korean / English (both system-level localized, including widgets and notifications)

**Privacy**

- All data stays on the device
- No server. No account. No tracking.

## What's interesting under the hood

**iOS widgets in an Expo app** are non-trivial — Expo doesn't natively support widget extensions. Solved with [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets) and three custom config plugins:

- `plugins/withSharedDefaults.js` — injects the Swift target + App Group entitlement
- `plugins/withAndroidWidget.js` — registers the Kotlin AppWidgetProvider during prebuild
- `plugins/withAppNameI18n.js` — generates Android `values-en/strings.xml` and cleans up an Expo prebuild quirk that leaks iOS `expo.locales` into Android resources (would trigger lint `ExtraTranslation` fatal otherwise)

**Native ↔ JS sync** via App Group `UserDefaults` (iOS) and `SharedPreferences` (Android), so widgets reflect state without IPC ceremony.

**Reminder system v2** — Instead of a single repeating DAILY trigger, we register the next 7 days of single-shot calendar reminders plus a reactivation alarm one day after the last. Each completion cancels only today's reminder for that habit (tomorrow's stays). App launches top up the queue. The reactivation tap reschedules a fresh 7-day window. Trade-off: more bookkeeping, but `expo-notifications` handler quirks don't apply since the queue is fully calendar-driven.

**Animated transitions** with `react-native-reanimated` 4 worklets running on the UI thread for 60 fps even on older devices.

## Release history

| Version | Released | Highlight |
|---------|----------|-----------|
| 1.2.0 | Planned | Empty-slot visibility, smarter reminders (skip-if-done + reactivation), Android polish |
| 1.1.1 | 2026-05-26 | HabitCard redesign (no checkbox, accent on the icon), graduation eligibility based on longest Flow, time picker UX |
| 1.1.0 | 2026-05-19 | English support, graduation system, Stats screen, brand rename to *Ssak: Three Habits* |
| 1.0.3 | 2026-04-28 | Lock-screen widgets (3 styles) |
| 1.0.2 | 2026-04-27 | Growth stages, brand-aligned celebration |
| 1.0.1 | 2026-04-19 | Onboarding alarm setup, simplified habit presets |
| 1.0.0 | 2026-04-12 | Public launch |

## Stack

`React Native 0.81` · `Expo SDK 54` (New Architecture) · `TypeScript` · `Zustand` · `AsyncStorage` · `Expo Router` · `Reanimated 4` · `i18next` + `react-i18next` · `expo-notifications` · `@bacons/apple-targets` (iOS widgets) · `Kotlin` (Android widget) · `EAS Build`

## Project structure

```
app/                          Expo Router screens (index, add, edit, settings, stats, onboarding)
src/
├── components/               UI primitives and habit cards
├── store/                    Zustand stores (habit, reward, settings, theme, onboarding)
├── utils/                    Flow calculation, notifications, widget data sync, date
├── i18n/                     i18next setup + ko/en locales
├── types/                    Shared TypeScript types
└── constants/                Theme tokens, growth stages, rewards, default habits
modules/
└── shared-defaults/          Native module — iOS UserDefaults + Android SharedPreferences bridge
plugins/
├── withSharedDefaults.js     iOS App Group + module injection
├── withAndroidWidget.js      Android widget provider registration
└── withAppNameI18n.js        Android values-en + iOS locale leak cleanup
targets/
├── HabitWidget/              Swift WidgetKit target (system + accessory families)
└── HabitWidgetAndroid/       Kotlin AppWidgetProvider + RemoteViews layouts
```

---

Built with Claude Code as the primary dev environment.
Author: [Hyun (qlemql)](https://github.com/qlemql) · taehyun_fe@naver.com
Privacy: [Privacy Policy](https://ssak-habit-tracker.pages.dev/privacy-policy.en.html) · [Terms](https://ssak-habit-tracker.pages.dev/terms-of-service.en.html)
