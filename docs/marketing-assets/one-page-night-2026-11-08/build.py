from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from tempfile import TemporaryDirectory
import imageio_ffmpeg, subprocess
root=Path(__file__).resolve().parent
source=root.parent/'reading-experiment-2026-10-23/sources/reading'
ff=imageio_ffmpeg.get_ffmpeg_exe()
def run(*args):
    subprocess.run([ff,'-loglevel','error','-y',*map(str,args)],check=True)
w,h=720,1280
def line(d,xy,s,size,color='#FFF7E5',bold=False):
    f=ImageFont.truetype('C:/Windows/Fonts/'+('seguisb.ttf' if bold else 'segoeui.ttf'),size)
    assert d.textlength(s,font=f)<632,s
    d.text(xy,s,font=f,fill=color)
def card(first,second):
    im=Image.new('RGB',(w,h),'#263E36')
    d=ImageDraw.Draw(im)
    line(d,(54,98),'SSAK   /   READING NIGHTS',24,'#D7E5BC',True)
    line(d,(54,198),first,53,bold=True)
    line(d,(54,269),second,53,bold=True)
    return im,d
with TemporaryDirectory() as tmp:
    base=Path(tmp)
    parts=[]
    for n,(a,b,foot,duration) in enumerate([
      ('Too tired for','ten minutes?','Give tonight a smaller plan.',3),
      ('Read one page.','Stop there if you like.','A bookmark is a place to begin.',4),
      ('After reading,','tap the option you did.','Web demo with sample data.',4),
      ('One page read.','One page recorded.','Try one reading habit free in Ssak.',4)]):
        im,d=card(a,b)
        if n==0:
            d.rounded_rectangle((150,455,547,858),24,fill='#D3A878')
            d.rounded_rectangle((142,444,534,839),23,fill='#E9CF9F')
            d.rectangle((167,448,175,834),fill='#AD865E')
            d.polygon([(406,444),(456,444),(456,551),(431,531),(406,551)],fill='#A44B36')
            line(d,(220,614),'Tonight',53,'#51422D',True)
        elif n==1:
            for x in (75,360):
                d.rounded_rectangle((x,493,x+282,820),12,fill='#F2E4C9')
                for j in range(6): d.line((x+32,570+j*27,x+225-(j%3)*14,570+j*27),fill='#C8B796',width=4)
            d.line((359,510,359,814),fill='#9D8A65',width=5)
            d.polygon([(557,493),(592,493),(592,590),(575,578),(557,590)],fill='#A44B36')
        elif n==3:
            shot=Image.open(source/'02-counts.png').convert('RGB').crop((24,216,406,582)).resize((512,490),Image.Resampling.LANCZOS)
            im.paste(shot,(104,432))
        line(d,(54,986),foot,29)
        if n>=2: line(d,(54,1052),'Example data · mobile layout may differ',21,'#D7E5BC')
        path=base/f'{n}.png'; im.save(path)
        out=base/f'{n}.mp4'; parts.append(out)
        args=['-loop','1','-framerate','24','-i',path]
        if n==2:
            args+=['-ss','1.5','-i',source/'recording.webm','-filter_complex','[1:v]crop=430:450:0:200,scale=500:-2,setsar=1[app];[0:v][app]overlay=110:410:eof_action=repeat,fps=24,format=yuv420p']
        else: args+=['-vf','format=yuv420p']
        run(*args,'-t',duration,'-an','-c:v','libx264','-preset','veryfast','-r','24',out)
    playlist=base/'list.txt'; playlist.write_text('\n'.join("file '"+p.as_posix()+"'" for p in parts))
    run('-f','concat','-safe','0','-i',playlist,'-c','copy','-movflags','+faststart',root/'reel.mp4')
    run('-i',root/'reel.mp4','-f','null','-')
    sheet=Image.new('RGB',(720,320))
    for n,t in enumerate((1,4,8,13)):
        frame=base/f'frame{n}.jpg'; run('-ss',t,'-i',root/'reel.mp4','-frames:v','1',frame)
        sheet.paste(Image.open(frame).resize((180,320)),(n*180,0))
    sheet.save(root/'preview.jpg')
