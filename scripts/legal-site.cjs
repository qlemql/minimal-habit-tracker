const fs = require('node:fs');
const path = require('node:path');
process.env.NODE_ENV ||= 'production';
require('@expo/env').load(process.cwd());
const { languages, releaseCopy, legalCopy } = require('./lib/renewal-copy.cjs');
const publicInfo = require('../release-public.json');
const output = path.resolve(__dirname, '../artifacts/legal-site');
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const email = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || publicInfo.supportEmail;
const operator = process.env.EXPO_PUBLIC_OPERATOR_NAME || publicInfo.operatorName;
const ready = !!email && !!operator && publicInfo.policyStatus === 'reviewed';
fs.mkdirSync(output, { recursive: true });
for (const { code, label } of languages) {
  const c = releaseCopy[code];
  for (const kind of ['privacy', 'terms', 'support']) {
    const dir = path.join(output, code, kind);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html lang="${code}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c[kind])} | Ssak</title>
<style>body{margin:auto;max-width:680px;padding:28px 22px 64px;background:#F7F7F2;color:#233C35;font:17px/1.8 system-ui,sans-serif;overflow-wrap:anywhere}h1{font-size:30px;line-height:1.3}a{color:#315E4C}nav{display:flex;gap:16px;flex-wrap:wrap}aside{padding:16px;background:#F4E8DA}</style>
${ready ? '' : '<aside>DRAFT — Ssak 2.0 policy. Final policy review and publication are pending.</aside>'}
<nav>${languages.map((lang) => `<a href="../../${lang.code}/${kind}/">${lang.label}</a>`).join('')}</nav>
<main><p>SSAK · ${label}</p><h1>${esc(c[kind])}</h1>${operator ? `<p>${esc(operator)}</p>` : ''}
${legalCopy[code][kind].map((p) => `<p>${esc(p)}</p>`).join('')}
${kind === 'support' ? `<p><a href="https://reportaproblem.apple.com/">App Store · ${esc(c.refund)}</a></p><p><a href="https://support.google.com/googleplay/answer/2479637?hl=${code}">Google Play · ${esc(c.refund)}</a></p>` : ''}
${kind === 'privacy' ? '<p><a href="https://www.revenuecat.com/privacy/">RevenueCat privacy policy</a></p>' : ''}
<p>${email ? `<a href="mailto:${esc(email)}">${esc(c.contact)} · ${esc(email)}</a>` : esc(c.contactMissing)}</p></main>
<nav>${['privacy', 'terms', 'support'].map((item) => `<a href="../${item}/">${esc(c[item])}</a>`).join('')}</nav></html>`);
  }
}
fs.writeFileSync(path.join(output, 'index.html'), '<!doctype html><meta charset="utf-8"><title>Ssak policies</title>' + languages.map((lang) => `<p><a href="./${lang.code}/privacy/">${lang.label}</a></p>`).join(''));
console.log(`Prepared 12 policy/support pages. Status: ${ready ? 'requires publication' : 'DRAFT: final policy review pending'}`);
