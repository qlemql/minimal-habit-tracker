# Ssak renewal — 2026-10-04

## Product decision
Build a quiet, local-first tool for someone starting a habit again after a previous attempt did not fit their life. A small action, an existing daily cue, a realistic weekly intention, a short review, and a reversible graduation form one complete journey. No garden, points, streak punishment, feed, AI service, or account is required.

This is a differentiated execution hypothesis, not a claim of a unique invention or guaranteed demand. Atoms already guides small habits; Fabulous offers journeys; Habitify offers reflection and completion conditions; Motif describes graduation. Japanese bondavi is a particularly strong free competitor. Research sources:
- https://atoms.jamesclear.com/
- https://help.thefabulous.co/en/support/solutions/articles/101000427409-what-is-a-journey-
- https://apps.apple.com/sg/app/habitify-habit-tracker/id1111447047
- https://bondavi.jp/one-min
- https://apps.apple.com/jp/app/id1120239484
- https://apps.apple.com/tw/app/habit-tracker/id1438388363
- https://play.google.com/store/apps/details?id=org.isoron.uhabits

## Scope and sequence
1. Preserve existing user data, add a versioned habit model and meaningful behavioral tests.
2. Implement Today / Journey / Settings, a guided habit editor, minimum-action check-in, weekly review, graduation and restart.
3. Ship English, Korean, Japanese and Traditional Chinese UI. Japanese/Chinese copy is a draft requiring native-speaker validation before store release.
4. Integrate one-time native purchase and restore behind configured store products. Never simulate a successful payment. No credentials or store product configuration are assumed.
5. Export/import a validated local backup; protect existing data on restore. Provide an explicitly labelled example journey only on an empty installation.
6. Build Expo web for an immediately reviewable working version of the same React Native app. Run browser flows, persistence/migration tests and mobile-width visual checks.

## Business decision
Replace the previous 14-day hard expiry with a permanently usable free journey. New installations: one active habit free, up to three with a one-time Ssak Plus purchase. As of 2026-10-06, there is no legacy access exception; existing records remain readable. Basic check-in, reflection and graduation remain free. Plus adds parallel journeys and portable backup. No subscription and no paid user acquisition assumed.

Test a US $7.99 lifetime price, localized through the store. It is a hypothesis, not a configured product or validated willingness to pay. The app displays the actual store price only when a matching lifetime offering is available.

Illustrative arithmetic: at $7.99 and an assumed 15% store fee, receipts before tax/refunds/SDK fees/labor are $6.79 per sale; at 30%, $5.59. 20 / 50 / 100 monthly sales yield roughly $136 / $340 / $679 at 15%. These are scenarios, not forecasts. Fixed $100 annual cash costs alone require about 15 sales at 15%; development and support time must be budgeted separately. Eligibility for fee programs must be verified, not assumed:
- https://developer.apple.com/app-store/small-business-program/
- https://support.google.com/googleplay/android-developer/answer/112622

## Launch validation plan (not executed)
Recruit 4–5 recent habit-app abandoners per initial language cohort: English and Japanese first, Traditional Chinese next. Ask about a real recent attempt, distinguish stopped behavior from stopped logging, and compare the complete flow with their existing tool. Follow a small cohort for 2 weeks; use voluntary interviews and store analytics before adding tracking infrastructure. Track first action, return after a miss, helpful plan adjustments, purchase interest and support burden. Do not infer profitability from downloads or ratings.

Publish only after real-device notifications, native widgets, store purchase/restore sandbox, localization and existing-user migration are validated. Local browser testing is not a substitute for these gates.

## Implementation and verification — completed locally

- Branch `feat/ssak-renewal`, based on main `7ae02eb`; no commit, push, release or store publication performed.
- Four language dictionaries are type checked against the same keys. Existing habit text is user content and is not translated when switching UI language.
- Persistence keeps `habit-store`, migrates to schema version 3, preserves records and free-habit selection, and removes legacy access. The old local development Pro switch is not treated as a receipt.
- Reminder requests occur only in the editor. Native scheduling uses platform-independent date triggers, serializes operations per habit, omits completed days, and refreshes a seven-day window when the app returns. There is no escalating reactivation campaign. The window can expire if the app is not opened for a week; this is a known design limit.
- Native explicit notification Done actions are idempotent and only apply to the notification's current local date. The existing native widget implementation is retained and requires device validation and visual alignment before release.
- RevenueCat integration reads the current lifetime package, displays its store price, purchases, restores and checks the `ssak_plus` entitlement. Missing public SDK keys or missing products leave purchase disabled. Store calls are mocked in automated tests; no actual payment was made.
- Backup validation rejects invalid dates, orphan records, duplicate habit/day entries and more than three active habits before replacement. A backup cannot grant Plus access.

### Checks

- `npm run typecheck`: passes.
- `npm run test:run`: 32 tests pass (migration/backup/calendar 14, lifecycle/limits 6, billing adapter 7, native notification contract 5).
- `npm run test:e2e`: 8 Playwright scenarios pass against the production web export: complete free journey, persisted v1 migration, language/layout checks at 360/375/390/1440px, invalid/valid backup restore, delete cancellation/confirmation.
- `npm run build`: production web export passes and the exported app is exercised in Chromium.
- `npx expo export --platform android --platform ios --output-dir dist-native`: Hermes bundles generated for both native platforms. This does not build/sign/install an APK or IPA or verify native modules on a device.
- Visual QA: checked desktop and mobile screenshots, reduced mobile header duplication, increased text contrast (muted text >=4.5:1 on the implemented panel backgrounds).
- `npm audit fix` applied compatible updates; `expo install --fix` aligned SDK 54 packages. Audit moved from 51 findings (2 critical) to 41 (0 critical; 24 high, 17 moderate). Remaining dependency chains include Expo/Metro, XML tooling, older UUID and test tooling; they are not all proven exploitable in the shipped runtime. Do not force-downgrade/upgrade Expo to satisfy audit suggestions. Dependency upgrades and exposure review remain a release gate.

### Reproduce on Windows

```powershell
cd C:\Users\TaeHyun\Desktop\workspace\minimal-habit-tracker
npm ci
npm run typecheck
npm run test:run
npm run build
npm run preview
```

Open http://localhost:4173. In another terminal, `npm run test:e2e` tests that preview. `node scripts/capture-renewal.cjs` captures the example journey in an isolated browser; output is under `artifacts/renewal/` (gitignored). `npx playwright install chromium` is needed once on a fresh machine. The preview server binds only to 127.0.0.1 and never exposes the repository root.

For regular development use `npm run web`. The Babel config enables Expo SDK 54's import.meta transform required by Zustand's ESM middleware in the web bundle. Reference: https://github.com/expo/expo/blob/main/packages/babel-preset-expo/README.md . Notification API reference: https://docs.expo.dev/versions/v54.0.0/sdk/notifications/ .

### Native billing setup and remaining release work

1. Create the non-consumable products in App Store Connect and Play Console; connect them to RevenueCat's `ssak_plus` entitlement and the current offering's lifetime package.
2. Put only platform public SDK keys from `.env.example` into `.env.local`. Never commit secret API keys.
3. Build a native development/release build and test sandbox purchase, cancellation, pending purchase, reinstall/restore and refund revocation. SDK integration alone is not payment validation. See https://www.revenuecat.com/docs/getting-started/installation/reactnative and https://www.revenuecat.com/docs/getting-started/restoring-purchases .
4. Verify notifications and widget actions on iOS and Android, including permission denial, midnight, timezone change and an existing user's records. This Windows environment has no configured Android SDK or macOS/Xcode.
5. Review Japanese and Traditional Chinese with native speakers, align existing app names/icons/widget visuals and public store screenshots, and check privacy/support/store disclosures against the final release configuration.

### Two final review passes

Product review: no claim that minimum habits, reflection or graduation are unique. The differentiator is the whole low-pressure restart journey. Free users can finish a useful journey without payment; purchase entitlement alone enables three active habits. No retention or revenue claims are inferred from automated tests.

Quality review: verified rollback on failed reminder edits, one record per habit/day, delayed reviews after restart, history retention on graduation, entitlement verification, safe restore validation, translation coverage and narrow-screen behavior. Remaining device/market/release work is explicitly separated from the locally completed prototype.
