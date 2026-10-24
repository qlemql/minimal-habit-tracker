# Ssak landing page

Updated 2026-10-24. Static four-language landing page using the current Soft Fold identity.

- English: `index.html`; Korean: `ko/index.html`; Japanese: `ja/index.html`; Traditional Chinese (Taiwan wording): `zh-TW/index.html`.
- Edit copy in `scripts/lib/landing-copy.json`, markup in `scripts/landing-site.cjs`, and styles in this directory. Regenerate from the repository root with `node scripts/landing-site.cjs`.
- HTML contains the complete translated content without JavaScript. Language links work when opened locally and when hosted under `/landing/`.
- The habit card is an illustration, explicitly labeled as an example. It is not an app screenshot.
- Both hero and download section link to the App Store and Google Play. Korea storefront availability was verified for iOS on 2026-10-18 and Android on 2026-10-24; other regions are not claimed as verified. Store URLs and verification dates live in `release-public.json`.
- Canonical/alternate/OG URLs target `release-public.json`'s `siteUrl` under `/landing/`. Deploy this directory at that path, or update the generator before using a different host.
- Contact uses the existing support email in `release-public.json`. No analytics, signup form, cookies or third-party scripts were added.
- Public policy files elsewhere in `docs/` still contain old brand/data descriptions; the newer legal generator is marked DRAFT by `policyStatus`. Do not treat those documents as reviewed. Final policy review/publication and linking verified localized policy URLs remain release work; no misleading legacy policy link was added here.
- Copy uses the current one-free-habit / up-to-three-habits Plus / one-time purchase / local records policy. Japanese and Traditional Chinese are drafts, not native-speaker-validated regional copy.
- The October 24 App Store + Google Play landing is live on Cloudflare Pages. All four public language pages were checked after deployment; see `docs/marketing-plan.ko.md`.

Verification: four languages, local file links, FAQ interaction, language navigation, canonical and alternate metadata, 320/390/1440px overflow checks, desktop/mobile visual review. `social-card.png` is a locally rendered brand sharing image.
