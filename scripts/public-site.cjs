// Stage only public-facing files; never upload repository docs, private notes or builds.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const output = path.join(root,'artifacts/public-site');
for(const script of ['landing-site.cjs','legal-site.cjs']) execFileSync(process.execPath,[path.join(__dirname,script)],{cwd:root,stdio:'inherit'});
fs.mkdirSync(output,{recursive:true});
for(const lang of ['en','ko','ja','zh-TW']) {
  fs.cpSync(path.join(root,'artifacts/legal-site',lang),path.join(output,lang),{recursive:true});
  fs.cpSync(path.join(root,'artifacts/legal-site',lang),path.join(root,'docs',lang),{recursive:true});
}
const landing = path.join(output,'landing'); fs.mkdirSync(landing,{recursive:true});
for(const name of ['index.html','style.css','mark.svg','social-card.png','ko','ja','zh-TW']) fs.cpSync(path.join(root,'docs/landing',name),path.join(landing,name),{recursive:true});
const redirects = {'index.html':'landing/','privacy-policy.html':'ko/privacy/','privacy-policy.en.html':'en/privacy/','terms-of-service.html':'ko/terms/','terms-of-service.en.html':'en/terms/'};
for(const [file,url] of Object.entries(redirects)) fs.writeFileSync(path.join(output,file),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=./${url}"><title>Ssak</title><a href="./${url}">Continue to Ssak</a></html>`);
for(const file of Object.keys(redirects).filter(file=>file!=='index.html')) fs.copyFileSync(path.join(output,file),path.join(root,'docs',file));
fs.writeFileSync(path.join(output,'vercel.json'),JSON.stringify({framework:null,buildCommand:null,outputDirectory:'.',redirects:Object.entries(redirects).map(([file,url])=>({source:file==='index.html'?'/':'/'+file,destination:'/'+url,permanent:false})),headers:[{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'}]}]},null,2));
fs.writeFileSync(path.join(output,'_redirects'),'/ /landing/ 302\n/privacy-policy /ko/privacy/ 302\n/privacy-policy.en /en/privacy/ 302\n/terms-of-service /ko/terms/ 302\n/terms-of-service.en /en/terms/ 302\n'+Object.entries(redirects).filter(([file])=>file!=='index.html').map(([file,url])=>`/${file} /${url} 302`).join('\n')+'\n');
fs.writeFileSync(path.join(output,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
fs.writeFileSync(path.join(output,'404.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><title>Page not found | Ssak</title><h1>Page not found</h1><a href="/landing/">Ssak home</a></html>');
console.log('Public-only deployment directory: artifacts/public-site. Policy status remains independently tracked in release-public.json.');
