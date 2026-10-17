# Ssak: Habit Tracker

**English** · [한국어](README.ko.md)

> Start small. Keep it manageable.
> On busy days, do the easier option you picked. It still counts.

📱 **v2.0** — App Store update in review · Google Play in preparation
🌐 [ssak-habit-tracker.pages.dev](https://ssak-habit-tracker.pages.dev/) · Instagram [@ssak.app](https://www.instagram.com/ssak.app/)

---

## Why I built this

Most habit attempts don't end because people stop caring. They end on a busy day. The plan was "read for 10 minutes", there was no time, the streak broke, and opening the app started to feel like a reminder of failure.

Ssak 1.x answered with a hard three-habit cap and a forgiving streak. Version 2.0 goes further: it is a quiet, local-first tool for starting a habit again after a previous attempt didn't fit your life. You plan for the busy day before it happens.

## Design decisions

### 1. Every habit has an easier option for busy days

When you make a plan, you answer three questions: *What would you like to do? What will you do this after? What's an easier option for busy days?*

```
Read for 10 minutes   ← usual plan
Read one page         ← on a busy day
```

On the Today screen you tap what you actually did. Both are recorded. Doing less still counts.

### 2. A weekly plan, not a perfect streak

You pick how many days a week feels manageable (3, 5 or 7). Progress is shown as days done this week (`4 / 5 days`). Missing a day doesn't erase the week. *Missed a day? You can start again.*

### 3. Review the plan, and stop tracking when you're ready

If it's been hard to keep up, the app suggests reviewing the plan: keep it, make the busy-day option easier, or restart. Once you no longer need daily check-ins, you can stop tracking a habit. Its history stays, and you can start tracking it again anytime.

### 4. One habit free, forever

One active habit is free with no time limit. **Ssak Plus** is a one-time purchase for up to three habits at once plus backup and restore. No subscription, no ads, no account.

## Features

**Habits**
- Guided plan editor with 18 built-in ideas, or create your own
- One-tap check-in for the usual plan or the easier option
- Weekly plan with 3 / 5 / 7 days
- Plan review prompts, stop tracking and restart, with history kept
- Example mode on an empty install, clearly labeled

**Reminders**
- Per-habit reminder time, requested only from the plan editor
- No reminder on days you already checked in
- *Done* action on the notification for today's date

**Widgets**
- iOS home-screen widgets (small / medium) and lock-screen widgets
- Android home-screen widget
- Layouts adapt to how many habits you track

**Backup**
- Export and import a backup file, or copy it as text (Plus)
- Backups are validated before anything on the device is replaced

**Languages**
- English, Korean, Japanese and Traditional Chinese (Taiwan), following the device language

**Privacy**
- Habit records are stored on the device. There is no Ssak server and no automatic sync.
- Purchases go through the App Store or Google Play, and RevenueCat verifies them with an anonymous app identifier. Habit names and notes are never sent.
- [Privacy Policy](https://ssak-habit-tracker.pages.dev/en/privacy/) · [Terms](https://ssak-habit-tracker.pages.dev/en/terms/) · [Support](https://ssak-habit-tracker.pages.dev/en/support/)

## What's interesting under the hood

**Same React Native app on the web.** The Expo web export of the app is what gets reviewed and end-to-end tested with Playwright. The marketing reels are recorded from it too. Native-only behavior (notifications, widgets, purchases) still requires device validation.

**Data migration without losing records.** The persisted `habit-store` is versioned (schema 3). Migration keeps existing habits and check-ins, maps 1.x data to the new model and removes the old trial-based access.

**Purchases that never pretend.** RevenueCat reads the current lifetime package, shows the real store price, purchases, restores and checks the `ssak_plus` entitlement. If the SDK key or product is missing, purchasing is disabled instead of simulated. A backup file can never grant Plus.

**Reminders as a calendar queue.** Instead of a repeating trigger, the app schedules single date-based reminders for the next seven days, skips completed days, serializes changes per habit and refreshes the window when the app returns. Notification *Done* actions are idempotent and apply only to their own date.

**iOS and Android widgets in an Expo app**, via [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets) and custom config plugins:
- `plugins/withSharedDefaults.js` — Swift widget target and App Group entitlement
- `plugins/withAndroidWidget.js` — Kotlin AppWidgetProvider registration during prebuild
- `plugins/withAppNameI18n.js` — localized Android app names and cleanup of an Expo prebuild locale leak
- `plugins/withWindowsCmakePaths.js` — keeps native build paths under the Windows MAX_PATH limit

Widgets read shared state through App Group `UserDefaults` (iOS) and `SharedPreferences` (Android).

**Four languages, one set of keys.** All UI dictionaries are type-checked against the same keys. User-written habit text is never translated.

## Development

```bash
npm ci
npm run typecheck
npm run test:run      # Vitest unit tests
npm run build         # Expo web export → dist/
npm run preview       # serves dist/ at http://127.0.0.1:4173
npm run test:e2e      # Playwright against the preview
```

Native purchases need platform **public** RevenueCat SDK keys in `.env.local` (see `.env.example`). Never commit secret keys. Implementation notes and release checks are in [docs/renewal-cycle.md](docs/renewal-cycle.md) and [docs/renewal-native-followup.md](docs/renewal-native-followup.md).

## Release history

| Version | Released | Highlight |
|---------|----------|-----------|
| 2.0.0 | In review (2026-10) | Renewal: easier option for busy days, weekly plan, plan review and stop tracking, one free habit + one-time Plus, backup, 4 languages, redesigned widgets |
| 1.2.0 | — | Empty-slot visibility, smarter reminders (skip-if-done + reactivation), Android polish |
| 1.1.1 | 2026-05-26 | HabitCard redesign, graduation eligibility based on longest Flow, time picker UX |
| 1.1.0 | 2026-05-19 | English support, graduation system, Stats screen, brand rename to *Ssak: Three Habits* |
| 1.0.3 | 2026-04-28 | Lock-screen widgets (3 styles) |
| 1.0.2 | 2026-04-27 | Growth stages, brand-aligned celebration |
| 1.0.1 | 2026-04-19 | Onboarding alarm setup, simplified habit presets |
| 1.0.0 | 2026-04-12 | Public launch |

## Stack

`React Native 0.81` · `Expo SDK 54` (New Architecture) · `TypeScript` · `Expo Router` · `Zustand` + `AsyncStorage` · `Reanimated 4` · `expo-notifications` · `RevenueCat` (`react-native-purchases`) · `@bacons/apple-targets` (iOS widgets) · `Kotlin` (Android widget) · `Vitest` · `Playwright` · `EAS Build`

## Project structure

```
app/                     Expo Router routes (Today, editor, My habits, settings, Plus, legal)
src/
├── renewal/             2.0 screens and logic: Today, Editor, Journey, Settings,
│                        domain rules, copy (4 languages), ideas, billing, backup
├── store/               Zustand persisted stores (habit-store schema v3, Plus access)
├── billing/             RevenueCat service and types
├── utils/               notifications, widget data sync, dates
└── components/, constants/, i18n/   shared UI, theme tokens, i18n setup
modules/shared-defaults/ Native module — iOS UserDefaults + Android SharedPreferences bridge
plugins/                 Expo config plugins (widgets, app name i18n, Windows paths)
targets/
├── HabitWidget/         Swift WidgetKit target (home + lock screen)
└── HabitWidgetAndroid/  Kotlin AppWidgetProvider + RemoteViews layouts
tests/                   Vitest unit tests, tests/e2e Playwright scenarios
scripts/                 web preview, store assets, legal and landing site generators
docs/                    product decisions, release notes, landing and policy pages
```

---

Built with Claude Code as the primary dev environment.
Author: [Hyun (qlemql)](https://github.com/qlemql) · taehyun_fe@naver.com
