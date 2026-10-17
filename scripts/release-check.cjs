const fs = require('node:fs');
const path = require('node:path');
process.env.NODE_ENV ||= 'production';
require('@expo/env').load(process.cwd());
const root = path.resolve(__dirname, '..');
const { expo } = require('../app.json');
const publicInfo = require('../release-public.json');
const results = [];
const check = (name, passed) => results.push({ name, passed: Boolean(passed) });
const env = process.env;
check('iOS production RevenueCat public SDK key', /^appl_/.test(env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || ''));
check('Android production RevenueCat public SDK key', /^goog_/.test(env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || ''));
check('Public support email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.EXPO_PUBLIC_SUPPORT_EMAIL || publicInfo.supportEmail));
check('Operator display name', (env.EXPO_PUBLIC_OPERATOR_NAME || publicInfo.operatorName)?.trim());
check('Public HTTPS website configured', /^https:\/\/(?!localhost\b|127\.0\.0\.1\b|example\.)[^/]+/.test(env.EXPO_PUBLIC_SITE_URL || publicInfo.siteUrl));
check('Renewal policy reviewed', publicInfo.policyStatus === 'reviewed');
check('Renewal version configured', expo.version === '2.0.0');
check('Four iOS system languages', ['en', 'ko', 'ja', 'zh-TW'].every((lang) => expo.ios.infoPlist.CFBundleLocalizations.includes(lang)));
const evidencePath = path.join(root, 'artifacts/release-evidence.json');
const evidence = fs.existsSync(evidencePath) ? JSON.parse(fs.readFileSync(evidencePath, 'utf8')) : {};
for (const name of [
  'store-build-numbers-confirmed', 'ios-xcode26-build', 'android-api36-build',
  'ios-device-flow', 'android-device-flow', 'upgrade-preserves-records',
  'widget-midnight-reboot-queue', 'notifications-permission-timezone-reboot',
  'purchase-cancel-pending-restore-both-stores', 'refund-revocation-both-stores',
  'revenuecat-server-notifications', 'privacy-disclosures-and-public-links',
  'store-contracts-tax-banking', 'native-store-screenshots',
  'accessibility-large-text-screen-readers', 'dependency-risk-review',
]) {
  const item = evidence[name];
  check(name, item?.status === 'passed' && typeof item.evidence === 'string' && item.evidence.trim().length > 10);
}
for (const item of results) console.log(`${item.passed ? 'PASS' : 'BLOCK'} ${item.name}`);
const blockers = results.filter((item) => !item.passed).length;
console.log(`\n${results.length - blockers}/${results.length} checks satisfied; ${blockers} release blockers.`);
console.log('Evidence is a manual review record, not independent proof of native/store validation.');
process.exitCode = blockers ? 1 : 0;
