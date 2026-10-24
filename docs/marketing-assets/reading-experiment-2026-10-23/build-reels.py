"""Original 9:16 layouts; unchanged Ssak web captures with example data."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg
import subprocess
import json
import shutil
import hashlib

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
READING = ROOT / 'sources/reading'
WEEKLY = REPO / 'docs/marketing-assets/x-restart-2026-10-19'
FF = imageio_ffmpeg.get_ffmpeg_exe()
BG, INK, BROWN, MUTED = '#FFF9EF', '#3A2A21', '#9C6842', '#826650'

def f(size, bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/' + ('seguisb.ttf' if bold else 'segoeui.ttf'), size)

def center(d, y, msg, size, color=INK, bold=False):
    for i, line in enumerate(msg.split('\n')):
        assert d.textlength(line, font=f(size,bold)) < 900, line
        d.text((540, y+i*(size+18)),line,font=f(size,bold),fill=color,anchor='mt')

def canvas(title, subtitle='', demo=True):
    im=Image.new('RGB',(1080,1920),BG)
    d=ImageDraw.Draw(im)
    center(d,135,'ssak',36,BROWN,True)
    center(d,255,title,76,INK,True)
    if subtitle:
        center(d,465,subtitle,31,MUTED)
    center(d,1630,'Web app demo · example data' if demo else 'A fictional reading-day scenario',26,MUTED)
    if demo:
        center(d,1680,'Mobile appearance may differ.',25,MUTED)
    return im

def run(args):
    subprocess.run([FF,'-y','-hide_banner','-loglevel','error',*args],check=True)

def segment(still, seconds, out):
    run(['-loop','1','-i',str(still),'-t',str(seconds),'-vf','fps=30,format=yuv420p',
         '-c:v','libx264','-preset','fast','-crf','19','-an',str(out)])

def join(parts, out):
    listing=out.with_suffix('.concat.txt')
    listing.write_text('\n'.join("file '"+str(x.resolve()).replace('\\','/')+"'" for x in parts),encoding='utf-8')
    run(['-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(out)])

def app_video(folder, source, trim, seconds, title, after, subtitle):
    a=canvas(title,subtitle)
    b=canvas(after,subtitle)
    a.save(folder/'frame-a.png'); b.save(folder/'frame-b.png')
    # Show the habit card and weekly records; preserve all text and actions.
    graph=("[2:v]crop=430:450:0:200,scale=850:-2,setsar=1[app];"
           "[0:v][1:v]overlay=0:0:enable='gte(t,3.4)'[bg];"
           "[bg][app]overlay=115:580:shortest=1,fps=30,format=yuv420p[out]")
    run(['-loop','1','-i',str(folder/'frame-a.png'),'-loop','1','-i',str(folder/'frame-b.png'),
         '-ss',str(trim),'-i',str(source),'-filter_complex',graph,'-map','[out]','-t',str(seconds),
         '-c:v','libx264','-preset','fast','-crf','19','-an',str(folder/'demo.mp4')])
    end=canvas('One page.\nRecorded as one page.','One habit free on iOS · link in bio.')
    screen=Image.open(READING/'02-counts.png').crop((24,216,406,582)).resize((680,652),Image.Resampling.LANCZOS)
    end.paste(screen,(200,630)); end.save(folder/'end.png')
    segment(folder/'end.png',2,folder/'end.mp4')
    join([folder/'demo.mp4',folder/'end.mp4'],folder/'reel.mp4')

def main():
    ROOT.mkdir(parents=True,exist_ok=True)
    READING.mkdir(parents=True,exist_ok=True)
    archived=REPO.parent/'ssak-instagram-launch/reel-en-01-busy'
    for name in ['recording.webm','01-today.png','02-counts.png','capture.json']:
        if not (READING/name).exists():
            shutil.copy2(archived/name,READING/name)
    specs=[
        ('01-busy-day-demo','2026-10-23','Your reading plan\nneeds a busy-day option.','Comparison and real recording'),
        ('02-reading-pov','2026-10-27','The plan:\none chapter.','Fictional POV with typography'),
        ('03-record-what-you-read','2026-10-30','One page.\nRecorded as one page.','One small action, accurately recorded'),
        ('04-weekly-plan','2026-11-03','A day off.\nStill a reading week.','Weekly example with a missed day'),
    ]
    manifest=[]
    for slug,date,title,purpose in specs:
        p=ROOT/slug; p.mkdir(exist_ok=True)
        caption=''
        if slug.startswith('01'):
            app_video(p,READING/'recording.webm',0.96,7,title,'Choose what\nyou actually read.','Ten minutes usually. One page on busy days.')
            caption="Your reading plan can have a busy-day option.\n\nIn Ssak, set your usual goal and a smaller alternative in advance. Then record what you actually read.\n\nOne habit free on iOS. No ads or subscriptions. Link in bio.\n\nSsak web app recording with example data, captured October 17. Mobile appearance may differ.\n\n#readinghabit #habittracker #smallhabits"
        elif slug.startswith('02'):
            frames=[]
            for n,(heading,sub) in enumerate([
                ('The plan:\none chapter.','POV: a reading day'),
                ('The day:\neverything else.','The chapter can wait. Your bookmark is patient.'),
                ('The bookmark:\nstill on duty.','')]):
                im=canvas(heading,sub,False)
                d=ImageDraw.Draw(im)
                # Original geometric book illustration, deliberately not app UI.
                d.rounded_rectangle((260,700,820,1380),35,fill='#9C6842')
                d.rounded_rectangle((290,700,820,1360),25,fill='#F0E6D8')
                d.rectangle((700,700,755,970),fill='#FF8068')
                im.save(p/f'frame-{n}.png'); segment(p/f'frame-{n}.png',3,p/f'part-{n}.mp4'); frames.append(p/f'part-{n}.mp4')
            join(frames,p/'reel.mp4')
            caption='the bookmark has excellent attendance.\n\nA fictional reading-day joke. #readinglife #bookish'
        elif slug.startswith('03'):
            frames=[]
            for n,(heading,imgname,sub) in enumerate([
                ('What did you\nactually read?','01-today.png','Choose the option that matches today.'),
                ('One page.\nRecorded as one page.','02-counts.png','A smaller action, not ten minutes in disguise.'),
                ('A day you read.\nSaved in your week.','02-counts.png','One habit free on iOS · link in bio.')]):
                im=canvas(heading,sub)
                shot=Image.open(READING/imgname).crop((24,216,406,628 if n==0 else 582))
                shot=shot.resize((760,round(shot.height*760/shot.width)),Image.Resampling.LANCZOS)
                im.paste(shot,((1080-shot.width)//2,600))
                im.save(p/f'frame-{n}.png'); segment(p/f'frame-{n}.png',3,p/f'part-{n}.mp4'); frames.append(p/f'part-{n}.mp4')
            join(frames,p/'reel.mp4')
            caption="Ten minutes and one page are different amounts. Ssak lets you record either, so a smaller reading day stays in your weekly record.\n\nOne habit free on iOS. Link in bio.\n\nWeb demo with example data, captured October 17. Mobile appearance may differ. #readinghabit #habittracker"
        else:
            a=canvas(title,'Your week can include days off.')
            b=canvas('Five reading days.\nOne included a page.','Example plan: five days this week.')
            a.save(p/'frame-a.png');b.save(p/'frame-b.png')
            graph=("[2:v]crop=430:430:0:250,scale=850:850,setsar=1[app];"
                   "[0:v][1:v]overlay=0:0:enable='gte(t,3.3)'[bg];"
                   "[bg][app]overlay=115:620:shortest=1,fps=30,format=yuv420p[out]")
            run(['-loop','1','-i',str(p/'frame-a.png'),'-loop','1','-i',str(p/'frame-b.png'),
                 '-ss','0.753','-i',str(WEEKLY/'recording.webm'),'-filter_complex',graph,'-map','[out]',
                 '-t','7.1','-c:v','libx264','-preset','fast','-crf','19','-an',str(p/'demo.mp4')])
            end=canvas('A plan for your week.','One habit free on iOS · link in bio.')
            d=ImageDraw.Draw(end)
            center(d,800,'Days off can fit.\nSmall reading days can, too.',52,BROWN,True)
            end.save(p/'end.png');segment(p/'end.png',2,p/'end.mp4')
            join([p/'demo.mp4',p/'end.mp4'],p/'reel.mp4')
            caption="Wednesday was a day off. Saturday was one page. This example week still has five recorded reading days.\n\nPlan the number of days that fits your life. One habit free on iOS. Link in bio.\n\nWeb demo with example data, captured October 17. This is not a user's result. Mobile appearance may differ. #readinghabit #smallhabits"
        (p/'instagram-caption.txt').write_text(caption+'\n',encoding='utf-8')
        (p/'description.txt').write_text(title.replace('\n',' ')+'\n'+purpose+'\nAll spoken information is presented as on-screen text. No voice-over.\n',encoding='utf-8')
        # Actual encoded frames for QA, not only source canvases.
        samples=[]
        for i,t in enumerate([0.5,4.5,8.2]):
            sample=p/f'qa-{i}.jpg'
            run(['-ss',str(t),'-i',str(p/'reel.mp4'),'-frames:v','1','-update','1',str(sample)])
            samples.append(sample)
        manifest.append({'id':slug,'planned_date_kst':date,'status':'READY_UNPUBLISHED',
                         'format':purpose,'hook':title.replace('\n',' '),'duration_seconds':9.1 if slug.startswith('04') else 9,
                         'path':str(p/'reel.mp4'),'source':'Original geometric illustration' if slug.startswith('02') else 'Existing Ssak English web demo; example data; October 17 capture',
                         'native_capture':False})
        print('Rendered '+slug,flush=True)
    sheet=Image.new('RGB',(1440,1920),'#E6D8C9')
    for row,spec in enumerate(specs):
        for col in range(3):
            shot=Image.open(ROOT/spec[0]/f'qa-{col}.jpg').resize((270,480),Image.Resampling.LANCZOS)
            sheet.paste(shot,(col*480+105,row*480))
    sheet.save(ROOT/'contact-sheet.jpg',quality=93)
    (ROOT/'manifest.json').write_text(json.dumps({'status':'RENDERED_PENDING_VISUAL_REVIEW','posts':manifest,
        'plan':'Four exploratory posts over two weeks; dates are planning targets, not scheduled publication. Adapt remaining posts after feedback.',
        'audio':'Silent; all information is visible; no third-party music.',
        'method':'Same reading audience, different formats. Not a randomized A/B test.',
        'source_hashes':{str(p.relative_to(REPO)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [READING/'recording.webm',READING/'01-today.png',READING/'02-counts.png',WEEKLY/'recording.webm']}},ensure_ascii=False,indent=2),encoding='utf-8')
    # Keep final videos, layouts and encoded QA frames; discard only our temporary segments.
    for slug,*_ in specs:
        p=ROOT/slug
        for name in ['demo.mp4','end.mp4','part-0.mp4','part-1.mp4','part-2.mp4','reel.concat.txt']:
            temporary=p/name
            if temporary.exists(): temporary.unlink()

if __name__=='__main__': main()
