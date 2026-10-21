from pathlib import Path
import json, subprocess, shutil, zipfile, re
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).parent
REPO = ROOT.parents[2]
SOURCE = REPO.parent / 'ssak-instagram-launch/demo-ko'
FF = imageio_ffmpeg.get_ffmpeg_exe()
BG, INK, MUTED, BROWN, LINE = '#FFF9EF', '#3A2A21', '#826650', '#9C6842', '#E6D8C9'
for name in ['video', 'images', 'copy', 'sources', 'qa']:
    (ROOT / name).mkdir(parents=True, exist_ok=True)
def font(size, bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/malgunbd.ttf' if bold else 'C:/Windows/Fonts/malgun.ttf', size)
def write(name, text):
    (ROOT / name).write_text(text.strip() + '\n', encoding='utf-8')
def header(im, label):
    d=ImageDraw.Draw(im)
    d.text((72,54),'ssak  /  싹',font=font(28,True),fill=BROWN)
    d.text((1008,62),label,font=font(20),fill=MUTED,anchor='ra')
def footer(im, number):
    d=ImageDraw.Draw(im)
    d.text((72,1285),'웹 앱 예시 화면 · 모바일 화면과 다를 수 있습니다',font=font(19),fill=MUTED)
    d.text((1008,1285),number,font=font(19),fill=MUTED,anchor='ra')
def paste_crop(im, src, box, x, y, width):
    crop=Image.open(src).convert('RGB').crop(box)
    h=round(crop.height*width/crop.width)
    crop=crop.resize((width,h),Image.Resampling.LANCZOS)
    mask=Image.new('L',crop.size,0);ImageDraw.Draw(mask).rounded_rectangle((0,0,width-1,h-1),32,fill=255)
    im.paste(crop,(x,y),mask)
def card(name,title,sub,screen,box):
    im=Image.new('RGB',(1080,1350),BG);d=ImageDraw.Draw(im);header(im,'평소 계획과 작은 대안')
    d.multiline_text((72,172),title,font=font(65,True),spacing=16,fill=INK)
    d.text((72,370),sub,font=font(29),fill=MUTED)
    paste_crop(im,screen,box,155,485,770)
    footer(im,name[:2]+' / 03');im.save(ROOT/'images'/name)
card('01-two-options.png','평소에는 책 10분,\n바쁜 날에는 한 문장.','두 가지를 미리 정해두는 습관 앱.',SOURCE/'02-today.png',(12,204,418,510))
card('03-record.png','한 문장을 읽었다면,\n한 문장으로 기록.','오늘 실제로 한 행동을 남겨요.',SOURCE/'03-done.png',(12,204,418,590))
im=Image.new('RGB',(1080,1350),BG);d=ImageDraw.Draw(im);header(im,'직접 정할 수 있는 대안 예시')
d.multiline_text((72,172),'내 습관에 맞게,\n바쁜 날의 대안도.',font=font(65,True),spacing=16,fill=INK)
d.text((72,370),'평소 목표와 작은 대안을 함께 정해요.',font=font(29),fill=MUTED)
for i,(kind,usual,tiny) in enumerate([('정리','10분 정리하기','물건 하나 제자리에'),('글쓰기','300자 쓰기','한 문장 쓰기'),('스트레칭','10분 하기','1분 하기')]):
    y=485+i*220
    d.rounded_rectangle((72,y,1008,y+190),26,fill='#FFFDF8',outline=LINE,width=2)
    d.text((104,y+24),kind,font=font(26,True),fill=BROWN)
    d.text((104,y+83),usual,font=font(33,True),fill=INK)
    d.text((580,y+83),tiny,font=font(31,True),fill=INK)
    d.line((532,y+70,532,y+150),fill=LINE,width=2)
    d.text((104,y+143),'평소 계획',font=font(20),fill=MUTED)
    d.text((580,y+143),'바쁜 날 대안',font=font(20),fill=MUTED)
d.text((72,1200),'미리 정해진 목록이 아니라, 직접 입력할 수 있는 예시입니다.',font=font(21),fill=MUTED)
footer(im,'02 / 03');im.save(ROOT/'images/02-examples.png')

# Real footage stays unchanged; only trim cuts and neutral framing are added.
cap=json.loads((SOURCE/'capture.json').read_text(encoding='utf-8'))
starts=[cap['trim']+2,cap['trim']+5.2,cap['trim']+8.7]
durations=[2.5,3.5,3.5]
headlines=['평소 계획과 작은 대안을 함께.','바쁜 날에는, 미리 정한 만큼.','오늘 실제로 한 행동을 기록.']
segments=[]
for i,(start,duration,title) in enumerate(zip(starts,durations,headlines)):
    frame=Image.new('RGB',(1080,1920),BG);d=ImageDraw.Draw(frame)
    d.text((72,65),'ssak  /  싹 · 사용 예시',font=font(30,True),fill=BROWN)
    d.text((72,145),title,font=font(49,True),fill=INK)
    d.text((72,1788),'실제 웹 앱 녹화 · 예시 습관 · 모바일 화면과 다를 수 있습니다',font=font(23),fill=MUTED)
    d.text((72,1844),'iOS에서 사용 가능  ·  습관 1개 무료',font=font(27,True),fill=INK)
    frame.save(ROOT/f'sources/frame-{i}.png')
    out=ROOT/f'sources/segment-{i}.mp4';segments.append(out)
    graph='[1:v]scale=740:1480,setsar=1[s];[0:v][s]overlay=170:270:shortest=1,format=yuv420p[v]'
    subprocess.run([FF,'-y','-hide_banner','-loglevel','error','-loop','1','-i',str(ROOT/f'sources/frame-{i}.png'),'-ss',str(start),'-i',str(SOURCE/'recording.webm'),'-filter_complex',graph,'-map','[v]','-t',str(duration),'-r','30','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-an',str(out)],check=True)
concat=ROOT/'sources/concat.txt';concat.write_text('\n'.join("file '"+p.resolve().as_posix()+"'" for p in segments),encoding='utf-8')
silent=ROOT/'video/ssak-intro-ko-9.5s-silent.mp4'
subprocess.run([FF,'-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(silent)],check=True)
music=ROOT/'video/ssak-intro-ko-9.5s-music.mp4'
subprocess.run([FF,'-y','-hide_banner','-loglevel','error','-i',str(silent),'-i',str(SOURCE/'ssak-soft-steps-original.wav'),'-map','0:v','-map','1:a','-af','afade=t=in:st=0:d=0.2,afade=t=out:st=8.8:d=0.7','-c:v','copy','-c:a','aac','-b:a','160k','-t','9.5','-movflags','+faststart',str(music)],check=True)
for i,t in enumerate([1,4,7.5]):
    subprocess.run([FF,'-y','-hide_banner','-loglevel','error','-ss',str(t),'-i',str(silent),'-frames:v','1',str(ROOT/f'qa/video-{i}.png')],check=True)
subprocess.run([FF,'-y','-hide_banner','-loglevel','error','-ss','3.5','-i',str(silent),'-frames:v','1',str(ROOT/'images/video-cover-1080x1920.png')],check=True)
for n in ['01-plan.png','02-today.png','03-done.png']:
    shutil.copyfile(SOURCE/n,ROOT/'sources'/n)
shutil.copyfile(REPO/'assets/icon.png',ROOT/'images/app-icon-1024.png')

write('copy/intro-short-ko.txt','싹은 평소 목표와 바쁜 날의 작은 대안을 함께 정하는 iOS 습관 앱입니다. 책 10분 읽기와 한 문장 읽기처럼 두 가지를 미리 정하고, 오늘 실제로 한 행동을 기록합니다.')
write('copy/intro-long-ko.txt','''싹은 습관을 만들 때 평소 목표와 바쁜 날의 작은 대안을 함께 정하는 iOS 앱입니다.

예를 들어 아침 커피를 마신 뒤 책 10분 읽기를 계획하면서, 바쁜 날에는 한 문장 읽기를 대안으로 정해둘 수 있습니다. 정리 10분과 물건 하나 제자리에 놓기, 글쓰기 300자와 한 문장 쓰기처럼 내 생활에 맞게 직접 입력할 수도 있습니다.

실천한 뒤에는 오늘 실제로 한 쪽을 선택해 기록합니다. 일주일에 실천할 날 수를 정하고, 돌아보기에서 대안이 버거우면 더 작게 조정할 수 있습니다.

습관 하나는 기간 제한 없이 무료입니다. 광고·회원가입·구독료가 없습니다. Plus는 일회성 구매로 동시 습관 최대 3개와 파일 백업·복원을 제공합니다. 기록은 기기에 저장되고 기기 간 자동 동기화는 지원하지 않습니다.

App Store: https://apps.apple.com/app/id6762334017
한국어 소개: https://ssak-habit-tracker.pages.dev/landing/ko/''')
write('copy/caption-ko.txt','''책 10분 읽기로 정했는데, 오늘은 한 문장만 읽었다면.
싹에서는 한 문장을 선택해 기록할 수 있습니다.

평소 목표와 바쁜 날의 작은 대안을 미리 정해두고, 오늘 한 만큼 남겨보세요.
독서뿐 아니라 정리·글쓰기·스트레칭 등에도 내 대안을 직접 정할 수 있어요.

습관 1개 무료 · 광고·회원가입·구독료 없음
현재 iOS에서 사용할 수 있습니다.

App Store: https://apps.apple.com/app/id6762334017

영상·앱 화면은 실제 웹 앱에 예시 습관을 입력해 녹화했습니다. 모바일 앱에서는 화면과 일부 동작이 다를 수 있습니다.''')
write('copy/facts-ko.txt','''앱 이름: 싹 (Ssak)
현재 공개 플랫폼: iOS
핵심 흐름: 실천할 상황·평소 목표·바쁜 날 대안을 설정 → 실제로 한 쪽 기록 → 돌아보며 대안 조정
무료 범위: 습관 1개, 기간 제한 없음
Plus: 일회성 구매, 동시 습관 최대 3개, 파일 내보내기·가져오기
광고·구독·회원가입: 없음
저장: 기기 내 저장. 기기 간 자동 동기화 미지원
Android: 준비 중. 출시일 미확정
App Store: https://apps.apple.com/app/id6762334017
한국어 소개: https://ssak-habit-tracker.pages.dev/landing/ko/
가격은 지역·시점에 따라 달라질 수 있어 자료에 고정 금액을 넣지 않았습니다.
효과·경쟁사 대비 우위·유일함을 검증된 사실로 주장하지 않습니다.''')
write('copy/alt-text-ko.txt','''01-two-options.png
‘평소에는 책 10분, 바쁜 날에는 한 문장’이라는 문구 아래 실제 싹 웹 앱 예시 화면. 책 10분 읽기와 한 문장 읽기 두 기록 버튼이 함께 보입니다.

02-examples.png
직접 설정할 수 있는 평소 목표와 작은 대안 예시 세 쌍: 정리 10분과 물건 하나 제자리에 놓기, 글쓰기 300자와 한 문장 쓰기, 스트레칭 10분과 1분. 앱에 미리 들어있는 고정 목록이 아니라 사용자가 직접 입력할 수 있는 예시입니다.

03-record.png
‘한 문장을 읽었다면, 한 문장으로 기록’이라는 문구와 실제 앱 예시. 한 문장 읽기를 선택한 뒤 ‘이만큼도 기록했어요’가 표시되고, 이번 주 계획은 1/5일로 바뀝니다. 독서량이 10분과 같다는 뜻은 아닙니다.

영상 설명
실제 웹 앱 예시 녹화. 실천 상황·평소 목표·작은 대안을 설정하고, 오늘 화면의 한 문장 읽기를 선택해 그 행동을 기록하는 9.5초 시연. 소리 없이도 한국어 제목과 앱 화면으로 내용을 따라갈 수 있습니다.''')
write('usage-notes-ko.txt','''한국어 공통 소개 자료 — 2026-10-20
상태: 자료 제작 완료, 외부 발송·게시·신청 없음.

video/: 한국어 9.5초 실제 앱 데모. 기본은 silent 파일, 배경음악이 필요할 때 music 파일 사용. 1080×1920 / H.264 / 30fps.
images/: 1080×1350 소개 이미지 3장(01→02→03), 1080×1920 영상 표지, 앱 아이콘.
copy/: 짧은 소개·긴 소개·캡션·사실 정보·대체 텍스트.
sources/: 앱 원본 캡처·영상 출처. 설명용 이미지와 실제 앱 화면을 구분.

출처: 2026-10-17 실제 한국어 Ssak 웹 빌드에서 예시 습관을 만들고 실행한 녹화. 네이티브 기기 녹화나 실제 사용자 후기라고 주장하지 않습니다.
배경음악: 기존 직접 합성한 오리지널 음원. 외부 샘플 사용 없음.
이미지: 코드로 조판한 텍스트·실제 앱 캡처. AI 일러스트 없음.

운영 결정: 기존 Instagram 후보 4곳은 부적합으로 제외. VibeCrew 무료 홍보는 10월 추가 문의 없이 11월 신청 검토. 자동 알림 미설정.
새 채널을 정할 때도 이 묶음을 먼저 검토한 뒤 채널 규격에 맞춰 사용하세요.''')
write('sources/provenance.json',json.dumps({'capture_date':'2026-10-17','source_recording':str(SOURCE/'recording.webm'),'source_capture':cap,'trim_starts':starts,'durations':durations,'total_seconds':9.5,'native_recording':False,'example_data':True,'ui_pixels':'Unchanged app recording and screenshots; crops and scaling only','examples_image':'Illustrative custom habit examples, not a screenshot or preset list','music':'Existing original procedural composition ssak-soft-steps-original.wav'},ensure_ascii=False,indent=2))

print('Created Korean introduction kit.')
