// Generate static, directly addressable landing pages. No client-side translation required.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs/landing');
const brand = require('../assets/brand/design.json');
const info = require('../release-public.json');
const copy = require('./lib/landing-copy.json');
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const logo = `<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="${brand.brown}" d="${brand.contour}"/><path fill="${brand.coral}" d="${brand.tip}"/></svg>`;
const check = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const externalArrow = '<svg class="button-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const downArrow = '<svg class="how-link-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14m-5-5 5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
fs.mkdirSync(output, {recursive:true});
fs.writeFileSync(path.join(output,'mark.svg'),logo.replace('aria-hidden="true"','xmlns="http://www.w3.org/2000/svg"'));
const languages = {en:'English',ko:'한국어',ja:'日本語','zh-TW':'繁體中文'};
const policyLabels = {en:['Privacy','Purchase terms'],ko:['개인정보처리방침','구매 안내'],ja:['プライバシー','購入について'],'zh-TW':['隱私權政策','購買說明']};
for (const [lang,c] of Object.entries(copy)) {
  const prefix = lang === 'en' ? './' : '../';
  const urlFor = code => prefix + (code === 'en' ? 'index.html' : code+'/index.html');
  const absolute = code => info.siteUrl+'/landing/'+(code==='en'?'':code+'/');
  const html = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(c.title)}</title><meta name="description" content="${escape(c.description)}">
<link rel="canonical" href="${absolute(lang)}">
${Object.keys(copy).map(code=>`<link rel="alternate" hreflang="${code}" href="${absolute(code)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${absolute('en')}">
<meta property="og:type" content="website"><meta property="og:title" content="${escape(c.title)}"><meta property="og:description" content="${escape(c.description)}"><meta property="og:url" content="${absolute(lang)}">
<meta property="og:image" content="${info.siteUrl}/landing/social-card.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${prefix}mark.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}style.css"></head>
<body><a class="skip" href="#main">${c.skip}</a><div class="wrap"><header><a class="brand" href="${urlFor(lang)}" aria-label="Ssak">${logo}<span>ssak</span></a><nav aria-label="${c.language}">${Object.entries(languages).map(([code,label])=>`<a href="${urlFor(code)}" lang="${code}" ${code===lang?'aria-current="page"':''}>${label}</a>`).join('')}</nav></header>
<main id="main"><section class="hero"><div class="hero-copy"><p class="eyebrow">${c.eyebrow}</p><h1>${c.heading.split("<br>").map((line,i)=>`<span class="headline-line${i===1?" accent":""}">${escape(line)}</span>`).join("")}</h1><p class="lead">${c.description}</p><div class="hero-actions"><a class="button" href="${escape(info.iosStoreUrl)}" target="_blank" rel="noopener"><span class="button-label">${c.cta}</span>${externalArrow}</a><a class="how-link" href="#how"><span class="how-link-content"><span>${c.howLink}</span>${downArrow}</span></a></div><p class="micro">${c.noaccount}</p></div><div class="illustration"><div class="habit-card"><div class="card-top"><span>${c.example}</span>${logo}</div><p class="habit-name">${c.read}</p><p class="timing">${c.after}</p><div class="goal-pair"><div class="goal"><span>${c.usual}</span><strong>${c.usualAmount}</strong><span class="goal-action">${c.goalAction}</span></div><div class="goal small-goal"><span>${c.busy}</span><strong>${c.busyAmount}</strong><span class="goal-action">${c.goalAction}</span></div></div><div class="record-example"><span>${c.recordLabel}</span><strong>${check}<span>${c.recordValue}</span></strong></div></div><p class="caption">${c.caption}</p></div><p class="habit-examples">${c.otherExamples}</p></section>
<div class="ribbon"><span>${c.ribbon[0]}</span><span>${c.ribbon[1]}</span><span>${c.ribbon[2]}</span></div>
<section class="how" id="how"><div class="section-heading"><p class="eyebrow">ROOM FOR REAL LIFE</p><h2>${c.how}</h2></div><div class="steps">${c.steps.map(([title,text],i)=>`<article><span class="number">0${i+1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></section>
<section class="plans"><div class="section-heading"><p class="eyebrow">START WITH ONE</p><h2>${c.plansTitle}</h2><p>${c.plansIntro}</p></div><div class="plan-grid"><article class="plan"><span class="tag">${c.free}</span><h3>${c.freeTitle}</h3><p>${c.freeText}</p><ul>${c.freeItems.map(t=>`<li>${t}</li>`).join('')}</ul></article><article class="plan plus"><span class="tag">SSAK PLUS</span><h3>${c.plusTitle}</h3><p>${c.plusText}</p><ul>${c.plusItems.map(t=>`<li>${t}</li>`).join('')}</ul></article></div><p class="fine">${c.device}</p></section>
<section class="faq"><div class="section-heading"><p class="eyebrow">GOOD TO KNOW</p><h2>${c.questions}</h2></div><div>${c.faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>
<section class="start" id="start"><div>${logo}<p class="eyebrow">MEET SSAK</p><h2>${c.startTitle}</h2><p>${c.availability}</p><div class="platforms"><span>${c.available}</span><span>Android · ${c.soon}</span></div><a class="button" href="${escape(info.iosStoreUrl)}" target="_blank" rel="noopener"><span class="button-label">${c.download}</span>${externalArrow}</a></div></section></main>
<footer><a class="brand" href="${urlFor(lang)}">${logo}<span>ssak</span></a><p>${c.footer}</p><div><a href="${prefix}../${lang}/privacy/">${policyLabels[lang][0]}</a><a href="${prefix}../${lang}/terms/">${policyLabels[lang][1]}</a><a href="${prefix}../${lang}/support/">${c.contact}</a><a href="https://www.instagram.com/ssak.app/" target="_blank" rel="noopener">Instagram ↗</a></div></footer></div></body></html>`;
  const target = lang==='en'?output:path.join(output,lang);
  fs.mkdirSync(target,{recursive:true}); fs.writeFileSync(path.join(target,'index.html'),html);
}
console.log('Generated four Ssak landing pages. iOS App Store link enabled; Android remains coming soon.');
