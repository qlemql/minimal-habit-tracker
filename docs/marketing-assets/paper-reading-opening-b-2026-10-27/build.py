"""Digital paper explanation + actual archived web demo. No simulated filming."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess, imageio_ffmpeg, json, hashlib

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / 'reading-experiment-2026-10-23/sources/reading'
FF = imageio_ffmpeg.get_ffmpeg_exe()
BG, INK, BROWN, CORAL = '#FFF9EF', '#3A2A21', '#9C6842', '#FF8068'

def font(size, bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/' + ('seguisb.ttf' if bold else 'segoeui.ttf'), size)

def lines(draw, text, y, size=60, color=INK, bold=False):
    for idx, line in enumerate(text.split('\n')):
        assert draw.textlength(line, font=font(size, bold)) < 900, line
        draw.text((540, y + idx * (size + 15)), line, font=font(size, bold), fill=color, anchor='mt')

def base(title, footer):
    im = Image.new('RGB', (1080, 1920), BG)
    d = ImageDraw.Draw(im)
    lines(d, 'ssak', 160, 38, BROWN, True)
    lines(d, title, 270, 64, INK, True)
    lines(d, footer, 1570, 27, BROWN)
    return im, d

def run(args):
    subprocess.run([FF, '-y', '-hide_banner', '-loglevel', 'error', *args], check=True)

def still(im, name, secs):
    im.save(ROOT / (name + '.png'))
    run(['-loop', '1', '-i', str(ROOT / (name + '.png')), '-t', str(secs), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-an', str(ROOT / (name + '.mp4'))])
    return ROOT / (name + '.mp4')

parts = []
im, d = base('One reading habit.\nTwo plans.', 'Digital note illustration · example plan')
d.rounded_rectangle((95, 570, 985, 1390), radius=24, fill='#FFFEFA', outline='#E3D5C4', width=3)
for y in range(690, 1350, 90):
    d.line((135, y, 945, y), fill='#EAE1D5', width=2)
lines(d, 'USUAL DAY', 650, 36, BROWN, True)
lines(d, 'Read for 10 minutes', 730, 56, INK, True)
lines(d, 'BUSY DAY', 980, 36, BROWN, True)
lines(d, 'Read one page', 1060, 60, INK, True)
d.line((300, 1150, 780, 1150), fill=CORAL, width=10)
parts.append(still(im, '01-hook', 2.5))

for name, seconds, alternative in [('02-usual', 1.5, False), ('03-two-plans', 2.5, True)]:
    im, d = base('Decide both in advance.', 'Digital note illustration · example plan')
    d.rounded_rectangle((95, 570, 985, 1390), radius=24, fill='#FFFEFA', outline='#E3D5C4', width=3)
    for y in range(690, 1350, 90):
        d.line((135, y, 945, y), fill='#EAE1D5', width=2)
    lines(d, 'USUAL DAY', 650, 36, BROWN, True)
    lines(d, 'Read for 10 minutes', 730, 56, INK, True)
    if alternative:
        lines(d, 'BUSY DAY', 980, 36, BROWN, True)
        lines(d, 'Read one page', 1060, 60, INK, True)
        d.line((300, 1150, 780, 1150), fill=CORAL, width=10)
    parts.append(still(im, name, seconds))

im, d = base('Record what you\nactually read.', 'Actual web demo · example data\nCaptured Oct 17, 2026 · mobile may differ')
im.save(ROOT / '04-demo-bg.png')
graph = '[1:v]crop=430:450:0:200,scale=850:-2,setsar=1[app];[0:v][app]overlay=115:560:shortest=1,fps=30,format=yuv420p[out]'
run(['-loop', '1', '-i', str(ROOT / '04-demo-bg.png'), '-ss', '1.5', '-i', str(SOURCE / 'recording.webm'), '-filter_complex', graph, '-map', '[out]', '-t', '5', '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-an', str(ROOT / '04-demo.mp4')])
parts.append(ROOT / '04-demo.mp4')

im, d = base('What would your\nbusy-day reading plan be?', 'One habit free on iOS & Android\nNo ads or subscriptions')
shot = Image.open(SOURCE / '02-counts.png').crop((24, 216, 406, 582))
shot = shot.resize((720, 690), Image.Resampling.LANCZOS)
im.paste(shot, (180, 650))
lines(d, 'Web demo · example data · Oct 17, 2026', 1440, 26, BROWN)
lines(d, 'Mobile appearance may differ.', 1485, 26, BROWN)
parts.append(still(im, '05-question', 3))

listing = ROOT / 'segments.txt'
listing.write_text('\n'.join("file '" + str(p).replace('\\', '/') + "'" for p in parts), encoding='utf-8')
run(['-f', 'concat', '-safe', '0', '-i', str(listing), '-c', 'copy', '-movflags', '+faststart', str(ROOT / 'reel.mp4')])
sheet = Image.new('RGB', (1350, 480), '#E6D8C9')
for index, ts in enumerate([1, 3, 5, 9, 13]):
    out = ROOT / f'qa-{index}.jpg'
    run(['-ss', str(ts), '-i', str(ROOT / 'reel.mp4'), '-frames:v', '1', '-update', '1', str(out)])
    sheet.paste(Image.open(out).resize((270, 480)), (index * 270, 0))
sheet.save(ROOT / 'preview.jpg', quality=95)
run(['-i', str(ROOT / 'reel.mp4'), '-f', 'null', '-'])
(ROOT / 'manifest.json').write_text(json.dumps({
    'created_at_kst': '2026-10-27', 'status': 'rendered-pending-visual-review',
    'candidate_publish_date_kst': '2026-10-30', 'published_url': None,
    'format': 'Original digital paper diagram, archived actual web recording, one closing question',
    'duration_seconds': 14.5, 'width': 1080, 'height': 1920, 'fps': 30,
    'audio': 'silent; all information is presented on screen',
    'source': 'Actual English web demo, example data, Oct 17, 2026; mobile appearance may differ',
    'paper_visual': 'Programmatically drawn digital note; not physical filming or handwriting footage',
    'source_sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in [SOURCE / 'recording.webm', SOURCE / '02-counts.png']},
    'verification': ['full decode passed', 'encoded QA frames extracted'],
    'measurement': {'published_at': None, '24h': None, '7d': None}
}, ensure_ascii=False, indent=2), encoding='utf-8')
for temporary in [*parts, listing]:
    temporary.unlink()
print(str(ROOT / 'reel.mp4'))
