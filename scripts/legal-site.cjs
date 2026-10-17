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
// Publishing corrected disclosures is separate from a complete release/legal review.
const publishable = ready || (!!email && !!operator && publicInfo.policyStatus === 'content-updated');
const website = {
 en: 'This website is hosted by Cloudflare. To deliver and protect the site, Cloudflare processes technical connection information such as IP addresses and request data. The landing page adds no advertising tracker, analytics script or signup form. Following an Instagram or store link opens a separate service governed by that service’s policies.',
 ko: '이 웹사이트는 Cloudflare에 호스팅됩니다. 사이트 제공과 보안을 위해 Cloudflare가 IP 주소와 요청 정보 등 기술적 접속 정보를 처리합니다. 랜딩 페이지에는 광고 추적기, 분석 스크립트, 가입 양식을 추가하지 않았습니다. Instagram이나 스토어 링크를 누르면 해당 서비스의 정책이 적용되는 별도 서비스로 이동합니다.',
 ja: 'このウェブサイトはCloudflareでホスティングされています。サイトの配信と保護のため、CloudflareはIPアドレスやリクエスト情報などの接続情報を処理します。ランディングページには広告トラッカー、分析スクリプト、登録フォームを追加していません。Instagramやストアのリンク先では、各サービスのポリシーが適用されます。',
 'zh-TW': '本網站由 Cloudflare 託管。為提供網站與維護安全，Cloudflare 會處理 IP 位址、請求資料等技術連線資訊。介紹頁面未加入廣告追蹤工具、分析程式或註冊表單。點選 Instagram 或商店連結後，將前往適用該服務政策的其他網站。',
};
fs.mkdirSync(output, { recursive: true });
for (const { code, label } of languages) {
  const c = releaseCopy[code];
  for (const kind of ['privacy', 'terms', 'support']) {
    const dir = path.join(output, code, kind);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html lang="${code}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c[kind])} | Ssak</title>
<style>body{margin:auto;max-width:740px;padding:28px 22px 64px;background:#FFF9EF;color:#443127;font:16px/1.9 system-ui,sans-serif;overflow-wrap:anywhere}h1{font-size:32px;line-height:1.3;letter-spacing:-1px}a{color:#9C6842;text-underline-offset:4px}nav{display:flex;gap:16px;flex-wrap:wrap;border-block:1px solid #e5d7c5;padding:16px 0;font-size:13px}aside{padding:16px;background:#F4E8DA}main{padding:20px 0}main p{margin:22px 0}</style>
${publishable ? '' : '<aside>DRAFT — Ssak 2.0 policy. Final policy review and publication are pending.</aside>'}
<nav>${languages.map((lang) => `<a href="../../${lang.code}/${kind}/">${lang.label}</a>`).join('')}</nav>
<main><p>SSAK · ${label}</p><h1>${esc(c[kind])}</h1>${operator ? `<p>${esc(operator)}</p>` : ''}
${legalCopy[code][kind].map((p) => `<p>${esc(p)}</p>`).join('')}
${kind === 'privacy' ? `<p>${esc(website[code])}</p><p><a href="https://www.cloudflare.com/privacypolicy/">Cloudflare privacy policy</a></p>` : ''}
${kind === 'support' ? `<p><a href="https://reportaproblem.apple.com/">App Store · ${esc(c.refund)}</a></p><p><a href="https://support.google.com/googleplay/answer/2479637?hl=${code}">Google Play · ${esc(c.refund)}</a></p>` : ''}
${kind === 'privacy' ? '<p><a href="https://www.revenuecat.com/privacy/">RevenueCat privacy policy</a> · <a href="https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety">RevenueCat data processing</a></p>' : ''}
<p>${email ? `<a href="mailto:${esc(email)}">${esc(c.contact)} · ${esc(email)}</a>` : esc(c.contactMissing)}</p></main>
<nav>${['privacy', 'terms', 'support'].map((item) => `<a href="../${item}/">${esc(c[item])}</a>`).join('')}<a href="../../landing/${code === 'en' ? '' : code + '/'}">Ssak</a></nav></html>`);
  }
}
fs.writeFileSync(path.join(output, 'index.html'), '<!doctype html><meta charset="utf-8"><title>Ssak policies</title>' + languages.map((lang) => `<p><a href="./${lang.code}/privacy/">${lang.label}</a></p>`).join(''));
console.log(`Prepared 12 policy/support pages. Status: ${publishable ? 'current disclosure ready for publication; full release review tracked separately' : 'DRAFT'}`);
