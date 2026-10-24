"""Build original marketing layouts using unchanged, previously captured app UI."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib
import json
import shutil
import zipfile

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parents[3] / 'ssak-instagram-launch' / 'reel-en-01-busy'
BG, INK, BROWN, MUTED = '#FFF9EF', '#3A2A21', '#9C6842', '#826650'

def font(size, bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/' + ('seguisb.ttf' if bold else 'segoeui.ttf'), size)

def text(draw, xy, value, size=30, color=INK, bold=False):
    draw.multiline_text(xy, value, font=font(size, bold), fill=color, spacing=9)

def base(n):
    im = Image.new('RGB', (1080, 1350), BG)
    d = ImageDraw.Draw(im)
    text(d, (76, 52), 'ssak', 37, BROWN, True)
    text(d, (667, 66), 'ROOM FOR REAL LIFE', 21, MUTED, True)
    d.line((76, 1255, 1004, 1255), fill='#E6D8C9', width=2)
    text(d, (76, 1280), 'Ssak web demo · example data', 23, MUTED)
    text(d, (910, 1280), f'0{n} / 03', 23, MUTED)
    return im, d

def screen(im, source, box, top):
    crop = Image.open(source).convert('RGB').crop(box)
    width = 680
    crop = crop.resize((width, round(crop.height * width / crop.width)), Image.Resampling.LANCZOS)
    im.paste(crop, ((1080-width)//2, top))
    return crop.height

def main():
    (ROOT / 'sources').mkdir(parents=True, exist_ok=True)
    provenance = []
    for name in ['01-today.png', '02-counts.png', 'capture.json']:
        src = SOURCE / name
        shutil.copy2(src, ROOT / 'sources' / name)
        provenance.append({'file': name, 'source': str(src), 'sha256': hashlib.sha256(src.read_bytes()).hexdigest()})

    im, d = base(1)
    text(d, (76, 191), '10 minutes.\nOr one page.', 104, bold=True)
    text(d, (76, 468), 'Make room for both kinds of days.', 36, MUTED)
    d.rounded_rectangle((76, 598, 1004, 836), 35, fill='#F0E6D8')
    text(d, (119, 631), 'YOUR USUAL PLAN', 23, MUTED, True)
    text(d, (119, 684), 'Read for 10 minutes', 53, bold=True)
    d.rounded_rectangle((76, 866, 1004, 1104), 35, fill='#9C6842')
    text(d, (119, 899), 'YOUR BUSY-DAY OPTION', 23, '#FFF5E5', True)
    text(d, (119, 952), 'Read one page', 53, '#FFF9EF', True)
    text(d, (76, 1155), 'Set both in advance. Then record what you did.', 30, MUTED)
    im.save(ROOT / '01-two-kinds-of-days.png')

    im, d = base(2)
    text(d, (76, 181), 'Plan both.\nBefore life happens.', 83, bold=True)
    text(d, (76, 406), 'Two options, ready when you check in.', 32, MUTED)
    screen(im, ROOT / 'sources/01-today.png', (24, 216, 406, 628), 490)
    im.save(ROOT / '02-plan-both.png')

    im, d = base(3)
    text(d, (76, 181), 'Read one page.\nRecord one page.', 88, bold=True)
    text(d, (76, 413), 'The smaller option counts as a recorded day.', 32, MUTED)
    screen(im, ROOT / 'sources/02-counts.png', (24, 216, 406, 582), 488)
    text(d, (76, 1158), 'One habit free on iOS. Link in bio.', 34, BROWN, True)
    im.save(ROOT / '03-record-one-page.png')

    names = ['01-two-kinds-of-days.png', '02-plan-both.png', '03-record-one-page.png']
    preview = Image.new('RGB', (1320, 550), '#EDE3D5')
    for i, name in enumerate(names):
        preview.paste(Image.open(ROOT / name).resize((432, 540), Image.Resampling.LANCZOS), (i*444, 5))
    preview.save(ROOT / 'preview.jpg', quality=94)
    (ROOT / 'provenance.json').write_text(json.dumps({
        'status': 'READY_UNPUBLISHED', 'created_date': '2026-10-23',
        'capture_date': '2026-10-17', 'sources': provenance,
        'native_capture': False, 'example_data': True,
        'ui_changes': 'Crop and resize only; app text, actions and recorded progress unchanged.',
        'format': '3-slide carousel, 1080x1350', 'ai_generated_visuals': False,
        'target': 'English-speaking readers whose available time varies',
        'purpose': 'Explain the regular and busy-day choices and recording, then invite profile/store interest.',
        'hook': '10 minutes. Or one page.',
        'limitation': 'Reuses the Oct 17 web demo; not a new native recording or a user outcome.'
    }, ensure_ascii=False, indent=2), encoding='utf-8')
    (ROOT / 'verification.json').write_text(json.dumps({
        'images': [{'file': n, 'size': list(Image.open(ROOT/n).size)} for n in names],
        'x_caption_characters': len((ROOT/'x-post.txt').read_text(encoding='utf-8').strip()),
        'status': 'RENDERED_PENDING_VISUAL_REVIEW'
    }, indent=2), encoding='utf-8')
    with zipfile.ZipFile(ROOT / 'ready-to-post.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for name in names + ['instagram-caption.txt', 'x-post.txt', 'alt-text.txt', 'review-ko.txt', 'provenance.json', 'preview.jpg']:
            z.write(ROOT / name, name)
    print('Built 3 carousel images, preview and posting kit.')

if __name__ == '__main__':
    main()
