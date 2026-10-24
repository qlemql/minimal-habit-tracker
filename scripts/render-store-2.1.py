"""Compose deterministic store graphics from real app captures; never fabricate UI.
Requires Pillow. Screenshots are placed unchanged except proportional scaling.
Default sources are web captures. Set --native-root to a directory containing
ios/<lang>/<scene>.png and android/<lang>/<scene>.png to compose native versions.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json, hashlib, argparse, html, zipfile

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--native-root',type=Path)
parser.add_argument('--output',type=Path,default=ROOT/'docs/store-assets/2.1.0')
parser.add_argument('--font-root',type=Path,default=Path('C:/Windows/Fonts'))
args=parser.parse_args()
OUT=args.output.resolve(); OUT.mkdir(parents=True,exist_ok=True)
COPY=json.loads((ROOT/'scripts/store-2.1-copy.json').read_text(encoding='utf-8'))
NATIVE=bool(args.native_root)
FONTS={'ko':('NotoSansKR-VF.ttf','NotoSansKR-VF.ttf'),'ja':('YuGothB.ttc','YuGothM.ttc'),'zh-TW':('msjhbd.ttc','msjh.ttc'),'en':('segoeuib.ttf','segoeui.ttf')}
INK='#342B24'; BROWN='#9C6842'; MUTED='#796A5C'; BG='#FFF9EF'
SIZES=[('ios',1320,2868),('android',1080,1920)]
records=[]; source_records={}; checks=[]

def font(lang,size,bold=False):
    p=args.font_root/FONTS[lang][0 if bold else 1]
    f=ImageFont.truetype(str(p),round(size))
    if lang=='ko' and bold:
        try:f.set_variation_by_name('Bold')
        except (OSError,ValueError):pass
    return f

def text(draw,xy,content,lang,size,fill=INK,bold=False,max_width=None):
    f=font(lang,size,bold)
    if max_width:
        while draw.textlength(content,font=f)>max_width and size>16:
            size-=1;f=font(lang,size,bold)
    box=draw.textbbox(xy,content,font=f,anchor='lt')
    draw.text(xy,content,font=f,fill=fill,anchor='lt')
    checks.append({'text':content,'bounds':box,'size':size})
    return box

def logo(draw,x,y,s=1,color=BROWN):
    f=ImageFont.truetype(str(args.font_root/'segoeuib.ttf'),round(57*s))
    draw.text((x,y),'ssak',font=f,fill=color,anchor='lt',stroke_width=0)
    draw.ellipse((x+125*s,y+11*s,x+135*s,y+21*s),fill='#FF8068')

def screenshot(platform,lang,scene):
    p=(args.native_root/platform/lang/(scene+'.png')) if NATIVE else OUT/'sources'/lang/(scene+'.jpg')
    raw=p.read_bytes();im=Image.open(p).convert('RGB')
    if im.width>=im.height:raise ValueError('Expected portrait app screenshot: '+str(p))
    source_records[str(p)]={'file':str(p.relative_to(OUT)) if p.is_relative_to(OUT) else str(p),'sha256':hashlib.sha256(raw).hexdigest(),'size':list(im.size),'native':NATIVE,'ui_modified':False}
    return p,im

def compose(platform,w,h,lang,index,slide):
    # 1080-unit layout, scaled uniformly for each store export.
    sc=w/1080; H=h/sc
    canvas=Image.new('RGB',(w,h),'#F2E5D3' if lang=='en' and index==0 else '#F7EFE3')
    d=ImageDraw.Draw(canvas)
    def t(x,y,s,txt,fill=INK,bold=False):return text(d,(x*sc,y*sc),txt,lang,s*sc,fill,bold,920*sc)
    logo(d,76*sc,51*sc,sc)
    t(78,141,23,slide['eyebrow'],COPY[lang]['accent'],True)
    size=84 if lang!='en' else 87
    for j,line in enumerate(slide['title']):t(76,194+j*105,size,line,INK,True)
    sub_y=194+len(slide['title'])*105+19
    for j,line in enumerate(slide['sub']):t(79,sub_y+j*48,32 if lang=='en' else 34,line,MUTED)
    # Subtle editorial rule, distinct from app controls.
    line_y=(sub_y+len(slide['sub'])*48+22)*sc
    d.line((78*sc,line_y,1002*sc,line_y),fill='#D8C6B1',width=max(1,round(sc)))
    _,im=screenshot(platform,lang,slide['id'])
    shot_y=(sub_y+len(slide['sub'])*48+64)*sc
    bottom=110*sc
    available=h-shot_y-bottom
    sw=min((778 if platform=='ios' else 610)*sc,available*im.width/im.height)
    sh=sw*im.height/im.width
    x=(w-sw)/2;y=shot_y
    # Backplate is outside the source pixels; no fake notch or OS frame.
    shadow=Image.new('RGBA',canvas.size);sd=ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x-10*sc,y-5*sc,x+sw+10*sc,y+sh+20*sc),radius=28*sc,fill=(94,61,36,42))
    shadow=shadow.filter(ImageFilter.GaussianBlur(19*sc));canvas.paste(shadow,(0,0),shadow)
    d=ImageDraw.Draw(canvas)
    d.rectangle((x-6*sc,y-6*sc,x+sw+6*sc,y+sh+6*sc),fill='#FFFCF6')
    resized=im.resize((round(sw),round(sh)),Image.Resampling.LANCZOS)
    canvas.paste(resized,(round(x),round(y)))
    # Outside UI footer indicates a sequence, with no pricing or download claim.
    t(79,H-54,20,COPY[lang]['label'],MUTED)
    for k in range(4):
        xx=(925+k*22)*sc
        d.ellipse((xx,(H-48)*sc,xx+8*sc,(H-40)*sc),fill=COPY[lang]['accent'] if k==index else '#D6C6B5')
    assert x>=0 and y>=0 and x+sw<=w and y+sh<=h
    p=OUT/platform/f'{w}x{h}'/lang/(slide['id']+'.png');p.parent.mkdir(parents=True,exist_ok=True)
    canvas.save(p,optimize=True)
    records.append({'file':p.relative_to(OUT).as_posix(),'platform':platform,'language':lang,'size':[w,h],'scene':slide['id'],'title':slide['title'],'source':source_records[str(screenshot(platform,lang,slide['id'])[0])]['file'],'uiFabricated':False})
    return canvas

def feature(lang,c):
    canvas=Image.new('RGB',(1024,500),'#F2E5D3');d=ImageDraw.Draw(canvas)
    logo(d,56,42,.8)
    for j,line in enumerate(c['feature']):text(d,(56,144+j*78),line,lang,58,INK,True,640)
    text(d,(58,341),c['featureSub'],lang,23,MUTED,False,650)
    # Original vector-like book motif; generated by layout code, no AI or UI.
    accent=c['accent']
    d.rounded_rectangle((768,130,916,360),radius=12,fill=accent)
    d.rounded_rectangle((753,123,900,349),radius=10,fill='#FFF9EF',outline=accent,width=4)
    d.line((775,124,775,346),fill=accent,width=4)
    for y in [176,199,222]:d.line((797,y,871,y),fill='#D2C0A6',width=3)
    d.line((870,124,870,169),fill='#FF8068',width=12)
    p=OUT/'android/feature-graphic'/f'{lang}.png';p.parent.mkdir(parents=True,exist_ok=True);canvas.save(p,optimize=True)
    records.append({'file':p.relative_to(OUT).as_posix(),'platform':'android','language':lang,'size':[1024,500],'type':'feature-graphic','containsAppUI':False})

for platform,w,h in SIZES:
    for lang,c in COPY.items():
        for i,slide in enumerate(c['slides']):compose(platform,w,h,lang,i,slide)
for lang,c in COPY.items():feature(lang,c)

# Compact contact sheets for reviewing every deliverable without opening 36 files.
for platform,w,h in SIZES:
    thumb_w=250;thumb_h=round(h/w*thumb_w)
    sheet=Image.new('RGB',(1120,4*(thumb_h+82)+60),BG);d=ImageDraw.Draw(sheet)
    for row,(lang,c) in enumerate(COPY.items()):
        yy=30+row*(thumb_h+82)
        text(d,(32,yy),c['label'],lang,22,INK,True)
        for col,slide in enumerate(c['slides']):
            p=OUT/platform/f'{w}x{h}'/lang/(slide['id']+'.png')
            shot=Image.open(p).resize((thumb_w,thumb_h),Image.Resampling.LANCZOS)
            sheet.paste(shot,(30+col*270,yy+40))
    sheet.save(OUT/f'overview-{platform}.jpg',quality=91)
first=Image.new('RGB',(1200,780),BG);d=ImageDraw.Draw(first)
for i,(lang,c) in enumerate(COPY.items()):
    text(d,(i*300+20,20),c['label'],lang,20,INK,True)
    im=Image.open(OUT/'ios/1320x2868'/lang/'01-today.png').resize((280,608),Image.Resampling.LANCZOS)
    first.paste(im,(i*300+10,62))
text(d,(20,713),'2.1.0 / LOCALIZED STORE CREATIVE', 'en',23, MUTED)
first.save(OUT/'first-screens.jpg',quality=94)

manifest={'release':'2.1.0','date':'2026-10-24','status':'design-complete-native-source-replacement-pending' if not NATIVE else 'native-assets-composed','uploaded':False,'source':'Real local Ssak web app, built-in localized sample data, captured via browser UI. Not iOS or Android screenshots.' if not NATIVE else 'User-provided native screenshots; provenance must be checked separately.','uiPixels':'Only proportional image scaling; no generated or translated UI pixels.','native':NATIVE,'assetCount':len(records),'assets':records,'sources':list(source_records.values()),'copyFile':'../../../scripts/store-2.1-copy.json','regenerate':'python scripts/render-store-2.1.py','officialSpecs':['https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications','https://support.google.com/googleplay/android-developer/answer/9866151?hl=en'],'review':{'dimensions':'checked','rgbNoAlpha':'checked','copy':'manual visual review required','nativeUI':'pending native screenshot replacement on Mac/Android','nativeAcceptanceTesting':'user chose not to run separate native acceptance tests; not marked passed'}}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sections=[]
for platform,w,h in SIZES:
    for lang,c in COPY.items():
        images=''.join(f'<figure><a href="{platform}/{w}x{h}/{lang}/{s["id"]}.png"><img src="{platform}/{w}x{h}/{lang}/{s["id"]}.png" alt="{html.escape(" ".join(s["title"]))}" loading="lazy"></a><figcaption>{html.escape(" ".join(s["title"]))}</figcaption></figure>' for s in c['slides'])
        sections.append(f'<section data-platform="{platform}" data-language="{lang}"><h2>{"App Store" if platform=="ios" else "Google Play"} · {c["label"]} <small>{w} × {h}</small></h2><p>{html.escape(c["angle"])}</p><div class="grid">{images}</div></section>')
page='''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ssak 2.1.0 · 네 언어 스토어 이미지</title><style>*{box-sizing:border-box}body{margin:0;background:#fff9ef;color:#342b24;font:15px/1.65 'Segoe UI','Malgun Gothic',sans-serif;padding:35px;max-width:1500px;margin:auto}h1{font-size:32px;letter-spacing:-1px}h2{margin-top:45px}small,p{color:#796a5c}.notice{padding:18px 22px;background:#f1e4d2;border-radius:12px;max-width:1100px}.controls{display:flex;gap:10px;position:sticky;top:0;padding:16px 0;background:#fff9eff5}select,a.btn{padding:8px 14px;background:white;border:1px solid #d8c6b1;border-radius:8px;font:inherit;color:inherit}a{color:#94623f}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}figure{margin:0}img{width:100%;border-radius:8px}figcaption{font-size:13px;padding:9px 0}.banners{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}section{border-top:1px solid #e1d3c1;margin-top:35px}footer{margin:40px 0}[hidden]{display:none!important}@media(max-width:700px){body{padding:18px}.grid{grid-template-columns:repeat(2,1fr)}.controls{flex-wrap:wrap}.banners{grid-template-columns:1fr}}</style><h1>같은 앱, 네 가지 공감의 시작.</h1><p>2.1.0 · 네 언어 × 스토어 화면 4장 · App Store / Google Play · Play 그래픽 4장</p><div class="notice"><strong>디자인 제작 완료 · 스토어 미업로드</strong><br>SOURCE_NOTICE<br>가격·무료·순위·성과 보장 문구와 타 스토어 로고는 넣지 않았습니다. UI는 실제 예시 화면이며 마케팅 이미지 제작용 합성 데이터입니다.</div><p><a href="upload-guide.txt">업로드·Mac 인계 안내</a> · <a href="manifest.json">전체 파일·출처</a> · <a href="creative-brief.txt">언어별 기획</a> · <a href="../../release-2.1.0-dashboard.html">2.1.0 대시보드</a></p><div class="controls"><select id="platform" aria-label="스토어"><option value="">모든 스토어</option><option value="ios">App Store</option><option value="android">Google Play</option></select><select id="language" aria-label="언어"><option value="">모든 언어</option>LANGUAGES</select></div>SECTIONS<h2>Google Play · Feature graphic <small>1024 × 500</small></h2><div class="banners">BANNERS</div><footer>이미지를 누르면 원본 PNG를 열 수 있습니다. 업로드 순서는 01 → 04입니다. UI 출처 교체 시 같은 파일명으로 원본을 준비하고 재생성하세요.</footer><script>const p=document.getElementById('platform'),l=document.getElementById('language');function filter(){document.querySelectorAll('section').forEach(s=>s.hidden=Boolean((p.value&&s.dataset.platform!==p.value)||(l.value&&s.dataset.language!==l.value)))}p.addEventListener('change',filter);l.addEventListener('change',filter);</script></html>'''
page=page.replace('SOURCE_NOTICE','현재 실제 웹 앱 화면으로 완성한 디자인입니다. Mac의 iOS / Android 네이티브 캡처 교체 전에는 최종 제출본으로 간주하지 않습니다.' if not NATIVE else '네이티브 캡처로 합성했습니다. 화면 출처와 앱 버전을 확인한 뒤 제출하세요.')
page=page.replace('LANGUAGES',''.join(f'<option value="{lang}">{c["label"]}</option>' for lang,c in COPY.items())).replace('SECTIONS',''.join(sections)).replace('BANNERS',''.join(f'<a href="android/feature-graphic/{lang}.png"><img src="android/feature-graphic/{lang}.png" alt="{c["label"]} feature graphic"></a>' for lang,c in COPY.items()))
(OUT/'index.html').write_text(page,encoding='utf-8')
for r in records:
    with Image.open(OUT/r['file']) as im:
        assert list(im.size)==r['size'] and im.mode=='RGB'
        assert (OUT/r['file']).stat().st_size<8_000_000
with zipfile.ZipFile(OUT/'ssak-2.1.0-store-designs.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in OUT.rglob('*'):
        if p.is_file() and p.suffix!='.zip': z.write(p,p.relative_to(OUT))
print(f'{len(records)} RGB assets + two full overviews + first-screen comparison + gallery + zip: {OUT}')
