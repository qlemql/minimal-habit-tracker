from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib, json, shutil, subprocess, zipfile
import imageio_ffmpeg

HERE=Path(__file__).resolve().parent
REPO=HERE.parents[2]
SRC=REPO/'artifacts/review/soft-fold'
SOURCES=HERE/'sources'
SOURCES.mkdir(exist_ok=True)
BG,INK,BROWN,MUTED='#FFF9EF','#3A2A21','#9C6842','#7A6759'

def font(size,bold=False):
 return ImageFont.truetype('C:/Windows/Fonts/'+('YuGothB.ttc' if bold else 'YuGothM.ttc'),size)

def lines(draw,xy,text,size,fill=INK,bold=False,leading=1.5):
 x,y=xy
 for line in text.split('\n'):
  assert draw.textlength(line,font=font(size,bold))<800,line
  draw.text((x,y),line,font=font(size,bold),fill=fill)
  y+=round(size*leading)

records=[]
for name in ['ja-plan.png','ja-today.png']:
 p=SRC/name
 shutil.copy2(p,SOURCES/name)
 records.append({'file':'sources/'+name,'source':str(p.relative_to(REPO)).replace('\\','/'),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'captureScript':'scripts/capture-soft-fold.cjs'})

specs=[
 ('01-plan','普段は10分。\n忙しい日は1ページ。','読書の計画に、\n小さな代案を用意します。','ja-plan.png'),
 ('02-record','今日、読めたほうを\nそのまま記録。','10分読んだ日も、1ページの日も。\n自分で決めた行動を選びます。','ja-today.png'),
 ('03-start','まずは、ひとつ。\n習慣1つは無料。','日本語対応・iOS / Android\n広告・登録・月額料金なし。\nPlusは買い切り。','ja-today.png')
]
for i,(slug,title,sub,screen) in enumerate(specs):
 im=Image.new('RGB',(1440,1080),BG)
 d=ImageDraw.Draw(im)
 lines(d,(64,55),'ssak',40,BROWN,True)
 lines(d,(64,160),title,58,bold=True)
 lines(d,(64,400),sub,30,leading=1.8)
 lines(d,(64,650),f'{i+1:02d} / 03  読書の計画例',23,BROWN)
 if i==2:
  lines(d,(64,750),'ssak-habit-tracker.pages.dev\n/landing/ja/',22,BROWN)
 raw=Image.open(SOURCES/screen).convert('RGB')
 raw.thumbnail((440,930),Image.Resampling.LANCZOS)
 x,y=960,40
 d.rounded_rectangle((x-2,y-2,x+raw.width+2,y+raw.height+2),22,fill='#E7DACB')
 im.paste(raw,(x,y))
 lines(d,(64,945),'Web版の保存画面・サンプルデータ（2026/10/05）\nストア版とは表示が異なる場合があります。',20,MUTED,leading=1.7)
 im.save(HERE/(slug+'.png'))

ff=imageio_ffmpeg.get_ffmpeg_exe()
parts=[]
for slug,*_ in specs:
 p=HERE/(slug+'.mp4')
 subprocess.run([ff,'-y','-hide_banner','-loglevel','error','-loop','1','-i',str(HERE/(slug+'.png')),'-t','4','-vf','fps=30,format=yuv420p','-c:v','libx264','-preset','fast','-crf','19','-an',str(p)],check=True)
 parts.append(p)
listing=HERE/'parts.txt'
listing.write_text('\n'.join("file '"+str(p.resolve()).replace('\\','/')+"'" for p in parts),encoding='utf-8')
video=HERE/'ssak-ja-screen-walkthrough.mp4'
subprocess.run([ff,'-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(video)],check=True)
for p in parts: p.unlink()
listing.unlink()
sheet=Image.new('RGB',(1440,360),BG)
for i,(slug,*_) in enumerate(specs):
 thumb=Image.open(HERE/(slug+'.png')).resize((480,360),Image.Resampling.LANCZOS)
 sheet.paste(thumb,(480*i,0))
sheet.save(HERE/'preview.jpg',quality=94)
manifest={'created':'2026-10-24','status':'prepared-not-sent-not-published','recipientCandidate':'pr@appllio.com','format':'3 still-screen slides, 1440x1080, 12 seconds, H.264, 30 fps, silent','sourceKind':'Archived actual Japanese web app screenshots; sample data; not a new native capture or an interaction recording','sourceSavedDate':'2026-10-05 (source file timestamps; screen date is also Oct 5)','uiEdits':'Screens resized only. No text or controls inside screenshots altered. Japanese explanatory layout added around intact screenshots.','sources':records,'existingEnglishSocialAccounts':'unchanged','aiGeneratedVisuals':False,'outcomes':None}
(HERE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
files=['appllio-email-ja.txt','media-facts-ja.txt','channel-review-ko.txt','manifest.json','01-plan.png','02-record.png','03-start.png','preview.jpg',video.name]
with zipfile.ZipFile(HERE/'ssak-japan-media-kit.zip','w',zipfile.ZIP_DEFLATED) as z:
 for file in files: z.write(HERE/file,file)
print('Created 3 Japanese screen slides, a 12-second video, and a reviewable media kit. Nothing sent.')
