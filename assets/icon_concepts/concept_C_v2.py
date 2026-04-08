"""
컨셉 C v2: "별자리 물방울" 개선판
===================================
개선 사항:
- 물방울 형태를 더 명확하게 (뾰족한 상단)
- 체크마크를 더 크고 명확하게
- 다크 배경을 약간 따뜻하게 (순수 네이비 → 다크 인디고/퍼플)
- 별 효과 정리 (너무 많으면 산만)
- 물방울 내부 하이라이트 개선
- 전체 밸런스 및 위치 재조정
"""

from PIL import Image, ImageDraw, ImageFont
import math, random

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

corner_r = 220

# === 배경: 따뜻한 다크 (다크 인디고) ===
for y in range(SIZE):
    t = y / SIZE
    r = int(22 + (18 - 22) * t)
    g = int(22 + (18 - 22) * t)
    b = int(38 + (34 - 38) * t)
    draw.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))

# 라운드 마스크
mask = Image.new('L', (SIZE, SIZE), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([0, 0, SIZE-1, SIZE-1], radius=corner_r, fill=255)
bg_flat = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
img = Image.composite(img, bg_flat, mask)
draw = ImageDraw.Draw(img)

# === 별 효과 (절제된 버전) ===
random.seed(77)
for _ in range(25):
    sx = random.randint(100, SIZE-100)
    sy = random.randint(100, SIZE-100)
    sr = random.choice([1, 1, 2, 2, 3])
    sa = random.randint(20, 55)
    draw.ellipse([sx-sr, sy-sr, sx+sr, sy+sr], fill=(255, 255, 255, sa))

# === 물방울 위치 (삼각형, 약간 위로) ===
drop1 = (512, 280)    # 상단 (메인)
drop2 = (310, 620)    # 좌하
drop3 = (714, 620)    # 우하

# === 연결선 (별자리, 부드럽게) ===
for p1, p2 in [(drop1, drop2), (drop1, drop3), (drop2, drop3)]:
    draw.line([p1, p2], fill=(255, 255, 255, 25), width=2)
    # 중간점에 작은 별
    mx, my = (p1[0]+p2[0])//2, (p1[1]+p2[1])//2
    draw.ellipse([mx-3, my-3, mx+3, my+3], fill=(255, 255, 255, 40))

# === 물방울 그리기 (개선) ===
def draw_drop_v2(img, cx, cy, size, color, has_check=False, glow_intensity=8):
    overlay = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)

    body_cy = cy + int(size * 0.15)

    # 글로우
    for i in range(20, 0, -1):
        ga = int(glow_intensity * (20-i) / 20)
        gr = size + i * 4
        od.ellipse([cx-gr, body_cy-gr, cx+gr, body_cy+gr],
                   fill=(color[0], color[1], color[2], ga))

    # 하단 원형 몸체
    od.ellipse([cx-size, body_cy-size, cx+size, body_cy+size], fill=color)

    # 상단 뾰족 (물방울 꼭짓점)
    tip_h = int(size * 1.1)
    tip_w = int(size * 0.48)
    od.polygon([
        (cx, cy - tip_h),
        (cx - tip_w, body_cy - int(size * 0.55)),
        (cx + tip_w, body_cy - int(size * 0.55)),
    ], fill=color)

    # 꼭짓점과 몸체 사이 부드럽게 연결 (작은 타원들)
    for t in range(5):
        tt = t / 5
        ty = cy - tip_h + (body_cy - size*0.55 - (cy - tip_h)) * tt
        tw = tip_w * (0.3 + 0.7 * tt)
        th = size * 0.15
        od.ellipse([cx-tw, ty-th, cx+tw, ty+th], fill=color)

    # 하이라이트 (좌상단 반사)
    hl_cx = cx - size * 0.3
    hl_cy = body_cy - size * 0.25
    hl_r = size * 0.22
    od.ellipse([hl_cx-hl_r, hl_cy-hl_r, hl_cx+hl_r, hl_cy+hl_r],
               fill=(255, 255, 255, 40))

    # 더 작은 하이라이트
    hl2_cx = cx - size * 0.15
    hl2_cy = body_cy - size * 0.45
    hl2_r = size * 0.1
    od.ellipse([hl2_cx-hl2_r, hl2_cy-hl2_r, hl2_cx+hl2_r, hl2_cy+hl2_r],
               fill=(255, 255, 255, 55))

    # 체크마크
    if has_check:
        cs = size * 0.5
        lw = max(10, int(size * 0.1))
        pts = [
            (cx - cs*0.38, body_cy + cs*0.05),
            (cx - cs*0.02, body_cy + cs*0.4),
            (cx + cs*0.48, body_cy - cs*0.3),
        ]
        od.line(pts, fill=(255, 255, 255, 245), width=lw)
        for p in pts:
            pr = lw // 2
            od.ellipse([p[0]-pr, p[1]-pr, p[0]+pr, p[1]+pr], fill=(255, 255, 255, 245))

    return Image.alpha_composite(img, overlay)

# 좌하 (블루)
img = draw_drop_v2(img, drop2[0], drop2[1], 95, (74, 144, 217, 220), glow_intensity=6)

# 우하 (코랄/피치)
img = draw_drop_v2(img, drop3[0], drop3[1], 95, (255, 168, 120, 220), glow_intensity=6)

# 상단 (그린, 메인 - 체크마크 포함, 더 큼)
img = draw_drop_v2(img, drop1[0], drop1[1], 125, (81, 207, 102, 240),
                   has_check=True, glow_intensity=10)

# 연결점 강조
draw = ImageDraw.Draw(img)
for pos in [drop1, drop2, drop3]:
    draw.ellipse([pos[0]-5, pos[1]-5, pos[0]+5, pos[1]+5], fill=(255, 255, 255, 50))

# 외곽선
draw.rounded_rectangle([2, 2, SIZE-3, SIZE-3], radius=corner_r,
                       outline=(255, 255, 255, 15), width=2)

img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_C_v2_drops.png', 'PNG')
print("Concept C v2 saved!")
