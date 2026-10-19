"""Reels EN-02/03: same template and original BGM as make-reel-en-01.py.

Usage: python make-reel-en.py 02|03  (after node record-reel-en.cjs 02|03)
No third-party recordings, samples or loops. Outputs a music version and a silent version.
"""
from pathlib import Path
import json, subprocess, sys
import numpy as np, wave
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

REELS = {
    '02': dict(dir='reel-en-02-plan-ios-launch', crop_h=860, screen_w=700,
               a='Build a habit plan\nin 15 seconds', b='Busy days are\ncovered too.',
               end='Your plan,\nin 15 seconds.'),
    '03': dict(dir='reel-03-missed-day-ios', crop_h=700, screen_w=860,
               a='Missed a day?', b='Your week\nstill counts.',
               end='A missed day.\nNot a lost week.'),
}
cfg = REELS[sys.argv[1]]
root = Path(__file__).parent
icon = Path('C:\\Users\\TaeHyun\\Desktop\\workspace\\ssak-instagram-launch\\profile-icon.png')
cap = json.loads((root / 'capture.json').read_text())
ff = imageio_ffmpeg.get_ffmpeg_exe()

W, H = 1080, 1920
BG, INK, BROWN, MUTED = '#FFF9EF', '#3A2A21', '#9C6842', '#826650'
FONT_B = 'C:/Windows/Fonts/segoeuib.ttf'
FONT_SB = 'C:/Windows/Fonts/seguisb.ttf'
FONT_R = 'C:/Windows/Fonts/segoeui.ttf'
f = lambda path, size: ImageFont.truetype(path, size)

# Crop the top of the 430x860 recording (header + habit card) and enlarge it for phone viewing.
CROP_H = cfg['crop_h']
SCREEN_W = cfg['screen_w']
SCREEN_H = round(SCREEN_W * CROP_H / 430)
SX, SY = (1080 - SCREEN_W) // 2, 330
SWITCH = round(cap['tapAt'] + 0.35, 2)   # headline changes right after the tap
SCREEN_END = cap['screenSeconds']
END_CARD = 3.5
TOTAL = SCREEN_END + END_CARD


def frame(path, headline):
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((W / 2, 92), 'ssak', font=f(FONT_SB, 34), fill=BROWN, anchor='mm')
    d.multiline_text((W / 2, 205), headline, font=f(FONT_B, 66), fill=INK, anchor='mm', align='center', spacing=10)
    # soft card shadow behind the rounded screen
    d.rounded_rectangle((SX - 6, SY - 6, SX + SCREEN_W + 6, SY + SCREEN_H + 6), 46, fill='#EADBC8')
    d.text((W / 2, 1790), 'Screen recording of the Ssak web app · example data', font=f(FONT_R, 27), fill=MUTED, anchor='mm')
    d.text((W / 2, 1840), 'Now on iOS · Android coming soon · @ssak.app', font=f(FONT_SB, 29), fill=INK, anchor='mm')
    im.save(path)


def end_card(path):
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    logo = Image.open(icon).convert('RGBA').resize((190, 190))
    round_mask = Image.new('L', (190, 190), 0)
    ImageDraw.Draw(round_mask).rounded_rectangle((0, 0, 189, 189), 44, fill=255)
    logo.putalpha(round_mask)
    im.paste(logo, ((W - 190) // 2, 520), logo)
    d.multiline_text((W / 2, 900), cfg['end'], font=f(FONT_B, 78), fill=INK, anchor='mm', align='center', spacing=14)
    d.text((W / 2, 1075), 'One habit free  ·  No account  ·  No ads', font=f(FONT_R, 36), fill=MUTED, anchor='mm')
    d.rounded_rectangle((300, 1210, 780, 1300), 45, fill=BROWN)
    d.text((W / 2, 1255), 'Now on the App Store', font=f(FONT_SB, 32), fill='#FFF9EF', anchor='mm')
    d.text((W / 2, 1390), '@ssak.app', font=f(FONT_SB, 40), fill=BROWN, anchor='mm')
    im.save(path)


frame(root / 'frame-a.png', cfg['a'])
frame(root / 'frame-b.png', cfg['b'])
end_card(root / 'end-card.png')
mask = Image.new('L', (SCREEN_W, SCREEN_H), 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, SCREEN_W - 1, SCREEN_H - 1), 40, fill=255)
mask.save(root / 'screen-mask.png')

silent = root / f"{cfg['dir']}-silent.mp4"
graph = (
    f"[3:v]crop=430:{CROP_H}:0:0,scale={SCREEN_W}:{SCREEN_H},setsar=1,format=rgba[s];[4:v]format=gray,scale={SCREEN_W}:{SCREEN_H}[m];"
    f"[s][m]alphamerge[screen];"
    f"[0:v][1:v]overlay=0:0:enable='gte(t,{SWITCH})'[bg];"
    f"[bg][screen]overlay={SX}:{SY}:shortest=1,trim=duration={SCREEN_END},setpts=PTS-STARTPTS,fps=30,format=yuv420p[main];"
    f"[2:v]trim=duration={END_CARD},setpts=PTS-STARTPTS,fps=30,format=yuv420p,fade=t=in:st=0:d=0.25:color=0xFFF9EF[end];"
    f"[main][end]concat=n=2:v=1:a=0[out]"
)
subprocess.run([ff, '-y', '-hide_banner', '-loglevel', 'error',
                '-loop', '1', '-t', str(SCREEN_END), '-i', str(root / 'frame-a.png'),
                '-loop', '1', '-t', str(SCREEN_END), '-i', str(root / 'frame-b.png'),
                '-loop', '1', '-t', str(END_CARD), '-i', str(root / 'end-card.png'),
                '-ss', str(cap['trim']), '-i', str(root / 'recording.webm'),
                '-loop', '1', '-i', str(root / 'screen-mask.png'),
                '-filter_complex', graph, '-map', '[out]', '-t', str(TOTAL), '-r', '30',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
                str(silent)], check=True)

# ---- Original lo-fi track: 96 BPM, Fmaj7 - Em7 - Dm7 - Cmaj7 ----
rate = 44100
n = int(rate * TOTAL)
L = np.zeros(n); R = np.zeros(n)
rng = np.random.default_rng(17)
beat = 60 / 96
hz = lambda midi: 440 * 2 ** ((midi - 69) / 12)


def add(sig, start, gain, pan=0.0):
    i = int(start * rate)
    if i >= n:
        return
    sig = sig[: n - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2)
    R[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2)


def keys(midi, length):
    t = np.arange(int(length * rate)) / rate
    fr = hz(midi)
    tone = np.sin(2 * np.pi * fr * t) + .35 * np.sin(2 * np.pi * 2 * fr * t) * np.exp(-t / .4) + .12 * np.sin(2 * np.pi * 3 * fr * t) * np.exp(-t / .2)
    env = (1 - np.exp(-t / .006)) * np.exp(-t / 1.6) * np.clip((length - t) / .08, 0, 1)
    trem = 1 + .12 * np.sin(2 * np.pi * 4.2 * t)
    return tone * env * trem


def bass(midi, length):
    t = np.arange(int(length * rate)) / rate
    env = (1 - np.exp(-t / .01)) * np.exp(-t / .9) * np.clip((length - t) / .05, 0, 1)
    return (np.sin(2 * np.pi * hz(midi) * t) + .2 * np.sin(2 * np.pi * 2 * hz(midi) * t)) * env


def kick():
    t = np.arange(int(.35 * rate)) / rate
    freq = 48 + 90 * np.exp(-t / .035)
    return np.sin(2 * np.pi * np.cumsum(freq) / rate) * np.exp(-t / .12)


def snare():
    t = np.arange(int(.25 * rate)) / rate
    noise = rng.standard_normal(len(t))
    noise = np.convolve(noise, [1, -1], 'same')          # brighten
    return (noise * .5 + np.sin(2 * np.pi * 190 * t) * .6) * np.exp(-t / .07)


def hat():
    t = np.arange(int(.06 * rate)) / rate
    noise = np.convolve(rng.standard_normal(len(t)), [1, -2, 1], 'same')
    return noise * np.exp(-t / .015)


chords = [(41, [57, 60, 64, 69]), (40, [55, 59, 62, 67]), (38, [53, 57, 60, 65]), (36, [55, 59, 64, 67])]
bar_len = 4 * beat
bars = int(np.ceil(TOTAL / bar_len))
for b in range(bars):
    root_note, tones = chords[b % 4]
    o = b * bar_len
    for k, m in enumerate(tones):                         # lightly strummed chord, re-struck on beat 3
        add(keys(m, 2 * beat), o + k * .018, .16, (k - 1.5) * .25)
        add(keys(m, 2 * beat), o + 2 * beat + .5 * beat + k * .018, .10, (k - 1.5) * .25)
    add(bass(root_note, 1.5 * beat), o, .42)
    add(bass(root_note + 7, beat), o + 2.5 * beat, .30)
    for k in [0, 2.5]:
        add(kick(), o + k * beat, .55)
    for k in [1, 3]:
        add(snare(), o + k * beat + .012, .20, .05)
    for k in range(8):
        swing = .045 if k % 2 else 0                     # gentle swing for a lo-fi feel
        add(hat(), o + k * .5 * beat + swing, .09 if k % 2 else .13, .3)

# vinyl-ish soft noise bed
add(np.convolve(rng.standard_normal(n), np.ones(30) / 30, 'same'), 0, .012)
t = np.arange(n) / rate
fade = np.clip(t / .15, 0, 1) * np.clip((TOTAL - t) / 1.2, 0, 1)
mix = np.stack([L, R], 1) * fade[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.4) * .8          # gentle saturation, no clipping
wav = root / 'ssak-lofi-steps-original.wav'
with wave.open(str(wav), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(rate)
    w.writeframes((mix * 32767).astype('<i2').tobytes())

final = root / f"{cfg['dir']}.mp4"
subprocess.run([ff, '-y', '-hide_banner', '-loglevel', 'error', '-i', str(silent), '-i', str(wav),
                '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
                '-af', 'loudnorm=I=-16:TP=-1.5:LRA=7', '-t', str(TOTAL), '-movflags', '+faststart', str(final)], check=True)

# preview strip + checks
preview = Image.new('RGB', (1440, 660), '#e9dfd2')
for i, sec in enumerate([1.0, SWITCH + 1.2, SCREEN_END - .5, SCREEN_END + 2.0]):
    target = root / f'still-{i}.png'
    subprocess.run([ff, '-y', '-hide_banner', '-loglevel', 'error', '-ss', str(sec), '-i', str(final), '-frames:v', '1', str(target)], check=True)
    im = Image.open(target); im.thumbnail((340, 605)); preview.paste(im, (10 + i * 358, 15))
preview.save(root / 'preview.jpg', quality=92)
probe = subprocess.run([ff, '-hide_banner', '-i', str(final), '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True, check=True)
summary = [x.strip() for x in probe.stderr.splitlines() if any(k in x for k in ['Duration:', 'Video:', 'Audio:', 'mean_volume', 'max_volume'])]
(root / 'verification.json').write_text(json.dumps({'total_seconds': TOTAL, 'music': 'original procedural synthesis (numpy), 96 BPM', 'external_samples': False, 'checks': summary}, indent=2), encoding='utf-8')
print('\n'.join(summary))
