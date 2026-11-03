from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg, subprocess, json, hashlib
root=Path('C:/Users/TaeHyun/Desktop/workspace/minimal-habit-tracker/docs/marketing-assets/one-page-2026-11-03')
root.mkdir(exist_ok=True)
src=root.parent/'reading-experiment-2026-10-23/sources/reading'
ff=imageio_ffmpeg.get_ffmpeg_exe()
def run(a): subprocess.run([ff,'-y','-hide_banner','-loglevel','error',*a],check=True)
def font(n,b=False): return ImageFont.truetype('C:/Windows/Fonts/'+('seguisb.ttf' if b else 'segoeui.ttf'),n)
def text(d,s,y,n=60,b=False):
 for i,line in enumerate(s.split('\n')):
  assert d.textlength(line,font=font(n,b))<880,line
  d.text((520,y+i*(n+14)),line,font=font(n,b),fill='#3A2A21',anchor='mt')
def base(title,sub):
 im=Image.new('RGB',(1080,1920),'#FFF9EF');d=ImageDraw.Draw(im)
 text(d,'ssak',135,36,True);text(d,title,245,64,True);text(d,sub,440,32)
 text(d,'Web demo · example data · Oct 17, 2026',1570,25);text(d,'Mobile appearance may differ.',1615,25)
 return im,d
parts=[]
im,d=base('Planned: 10 minutes.\nRead: 1 page.','A busy-day reading scenario')
text(d,'Leave today blank?',850,66,True)
text(d,'That page still happened.',1000,46)
im.save(root/'00-hook.png')
run(['-loop','1','-i',str(root/'00-hook.png'),'-t','3','-vf','fps=30,format=yuv420p','-c:v','libx264','-preset','fast','-crf','19','-an',str(root/'part-0.mp4')]);parts.append(root/'part-0.mp4')
# Immediate real action; archived screen recording, no recreated app interface.
im,d=base('Keep the page\nyou actually read.','Choose a smaller option in advance.')
im.save(root/'01-action.png')
graph='[1:v]crop=430:450:0:200,scale=800:-2,setsar=1[app];[0:v][app]overlay=120:570:shortest=1,fps=30,format=yuv420p[out]'
run(['-loop','1','-i',str(root/'01-action.png'),'-ss','1.5','-i',str(src/'recording.webm'),'-filter_complex',graph,'-map','[out]','-t','4','-c:v','libx264','-preset','fast','-crf','19','-an',str(root/'part-1.mp4')]);parts.append(root/'part-1.mp4')
for name,title,sub,duration in [('02-result','One page.\nRecorded as one page.','A smaller plan, not ten minutes in disguise.',4),('04-question','Try one reading habit\nin Ssak.','One habit free · iOS & Android · Link in bio',4)]:
 im,d=base(title,sub)
 shot=Image.open(src/'02-counts.png').crop((24,216,406,582));shot=shot.resize((760,728),Image.Resampling.LANCZOS);im.paste(shot,(140,610))
 im.save(root/(name+'.png'));out=root/(name+'.mp4')
 run(['-loop','1','-i',str(root/(name+'.png')),'-t',str(duration),'-vf','fps=30,format=yuv420p','-c:v','libx264','-preset','fast','-crf','19','-an',str(out)]);parts.append(out)
listing=root/'segments.txt';listing.write_text('\n'.join("file '"+str(p).replace('\\','/')+"'" for p in parts),encoding='utf-8')
run(['-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(root/'reel.mp4')])
sheet=Image.new('RGB',(1350,480),'#E6D8C9')
for i,t in enumerate([0.1,3.2,5.7,8,13]):
 p=root/f'qa-{i}.jpg';run(['-ss',str(t),'-i',str(root/'reel.mp4'),'-frames:v','1','-update','1',str(p)]);sheet.paste(Image.open(p).resize((270,480)),(270*i,0))
sheet.save(root/'preview.jpg',quality=95)
run(['-i',str(root/'reel.mp4'),'-f','null','-'])
(root/'manifest.json').write_text(json.dumps({'status':'ready_pending_visual_review','created_date_kst':'2026-11-03','duration_seconds':15,'size':[1080,1920],'fps':30,'audio':'silent','source':'Actual Ssak English web captures, example data, October 17; mobile appearance may differ','experiment':'Scenario first, then actual demo; separate from Reel B; not randomized A/B','source_sha256':{n:hashlib.sha256((src/n).read_bytes()).hexdigest() for n in ['recording.webm','02-counts.png']},'published_urls':{},'verification':['full video decode passed']},ensure_ascii=False,indent=2),encoding='utf-8')
for p in parts+[listing]: p.unlink()
print(root/'reel.mp4')
