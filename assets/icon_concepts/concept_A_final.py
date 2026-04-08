"""
컨셉 A 최종: "세 잎 새싹" (Three Leaf Sprout)
==============================================
v2 대비 개선:
- 잎 안의 체크마크 제거 → 소형 사이즈에서 뭉개짐
- 대신 잎 자체의 형태와 색상 차이로 3개/성장 표현
- 줄기를 더 자연스럽게, 잎과 직접 연결
- 전체적으로 더 미니멀하고 깔끔하게
"""

from PIL import Image, ImageDraw
import math

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# === 배경 ===
bg = (255, 248, 240, 255)
cr = 220
draw.rounded_rectangle([0, 0, SIZE-1, SIZE-1], radius=cr, fill=bg)

# 부드러운 글로우
for i in range(25, 0, -1):
    a = int(4 * (25-i)/25)
    r = 250 + i*6
    draw.ellipse([512-r, 450-r, 512+r, 450+r], fill=(81, 207, 102, a))

# === 줄기 (원들로 부드럽게) ===
def lerp(a, b, t): return a + (b-a)*t

stem_steps = 150
for i in range(stem_steps):
    t = i / stem_steps
    # 약간 S자 곡선
    x = 512 + math.sin(t * math.pi * 0.3) * 8
    y = lerp(760, 310, t)
    # 색상: 블루→그린
    cr_ = int(lerp(74, 65, t))
    cg = int(lerp(144, 175, t))
    cb = int(lerp(217, 140, t))
    # 두께: 아래 굵고 위 가늘게
    th = lerp(13, 7, t)
    draw.ellipse([x-th, y-th, x+th, y+th], fill=(cr_, cg, cb, 255))

# === 잎 (깔끔한 타원 + 끝) ===
def make_leaf(cx, cy, w, h, angle, color):
    leaf = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    ld = ImageDraw.Draw(leaf)

    # 메인 타원
    ld.ellipse([cx-w//2, cy-h//2, cx+w//2, cy+h//2], fill=color)

    # 상단 뾰족
    th = int(h*0.22)
    tw = int(w*0.2)
    ld.polygon([
        (cx, cy - h//2 - th),
        (cx-tw, cy - h//2 + int(h*0.06)),
        (cx+tw, cy - h//2 + int(h*0.06)),
    ], fill=color)

    # 하단 약간 뾰족
    bh = int(h*0.1)
    bw = int(w*0.13)
    ld.polygon([
        (cx, cy + h//2 + bh),
        (cx-bw, cy + h//2 - int(h*0.04)),
        (cx+bw, cy + h//2 - int(h*0.04)),
    ], fill=color)

    # 잎맥 (살짝)
    ld.line([(cx, cy-h//2+15), (cx, cy+h//2-10)], fill=(255,255,255,30), width=2)

    return leaf.rotate(angle, center=(cx, cy), resample=Image.BICUBIC)

# 잎 1: 좌하 (연한, 작은)
img = Image.alpha_composite(img, make_leaf(380, 580, 110, 150, 38, (168,230,207,235)))

# 잎 2: 우중 (중간)
img = Image.alpha_composite(img, make_leaf(650, 465, 135, 180, -30, (123,212,160,245)))

# 잎 3: 상단 (진한, 큰)
img = Image.alpha_composite(img, make_leaf(495, 285, 160, 215, 7, (81,207,102,255)))

# === 체크마크: 큰 잎(상단) 위에만, 크고 명확하게 ===
draw = ImageDraw.Draw(img)
# 상단 잎의 회전을 고려한 체크마크 위치
ck_cx, ck_cy = 495, 295
ck_s = 45
lw = 12
pts = [
    (ck_cx - ck_s*0.4, ck_cy + ck_s*0.05),
    (ck_cx - ck_s*0.02, ck_cy + ck_s*0.4),
    (ck_cx + ck_s*0.48, ck_cy - ck_s*0.3),
]
draw.line(pts, fill=(255,255,255,220), width=lw)
for p in pts:
    draw.ellipse([p[0]-lw//2, p[1]-lw//2, p[0]+lw//2, p[1]+lw//2], fill=(255,255,255,220))

# === 하단 도트 3개 ===
dot_y = 855
dots_x = [445, 512, 579]
dot_colors = [(168,230,207,180), (123,212,160,200), (81,207,102,230)]
for x, c in zip(dots_x, dot_colors):
    draw.ellipse([x-14, dot_y-14, x+14, dot_y+14], fill=c)

# 외곽
draw.rounded_rectangle([2, 2, SIZE-3, SIZE-3], radius=220, outline=(210,200,190,25), width=2)

img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_A_final.png', 'PNG')
print("Concept A final saved!")
