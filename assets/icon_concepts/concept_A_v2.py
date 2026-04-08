"""
컨셉 A v2: "세 잎 새싹" 개선판
================================
개선 사항:
- 줄기를 부드러운 단일 곡선으로 (톱니 제거)
- 잎이 줄기에서 자연스럽게 뻗어나옴
- 잎 형태를 더 유기적으로 (뾰족한 끝 + 둥근 몸체)
- 체크마크를 더 굵고 명확하게
- 하단 도트를 더 의미 있게 (3개 중 채워진 정도)
- 전체 중앙 정렬 및 밸런스 개선
"""

from PIL import Image, ImageDraw, ImageFont
import math

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# === 배경 ===
bg_color = (255, 248, 240, 255)  # #FFF8F0
corner_r = 220
draw.rounded_rectangle([0, 0, SIZE-1, SIZE-1], radius=corner_r, fill=bg_color)

# 부드러운 원형 글로우
for i in range(30, 0, -1):
    alpha = int(5 * (30 - i) / 30)
    r = 280 + i * 5
    draw.ellipse([512-r, 460-r, 512+r, 460+r], fill=(81, 207, 102, alpha))

# === 줄기 (부드러운 곡선, anti-aliased) ===
# 별도 레이어에서 줄기 그리기
stem_layer = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
stem_draw = ImageDraw.Draw(stem_layer)

def cubic_bezier(p0, p1, p2, p3, steps=200):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3*p0[0] + 3*u**2*t*p1[0] + 3*u*t**2*p2[0] + t**3*p3[0]
        y = u**3*p0[1] + 3*u**2*t*p1[1] + 3*u*t**2*p2[1] + t**3*p3[1]
        pts.append((x, y))
    return pts

# 메인 줄기: 하단에서 상단으로
stem_pts = cubic_bezier(
    (512, 770), (505, 640), (520, 500), (512, 350),
    steps=200
)

# 줄기를 두꺼운 원으로 그려서 부드럽게 (안티앨리어싱)
for i, (x, y) in enumerate(stem_pts):
    t = i / len(stem_pts)
    # 블루 → 그린 그라데이션
    r = int(74 + (60 - 74) * t)
    g = int(144 + (180 - 144) * t)
    b = int(217 + (130 - 217) * t)
    # 줄기 두께: 하단 굵고 상단 가늘게
    thickness = int(14 - 5 * t)
    stem_draw.ellipse([x-thickness, y-thickness, x+thickness, y+thickness],
                      fill=(r, g, b, 255))

img = Image.alpha_composite(img, stem_layer)

# === 잎 그리기 (개선된 형태) ===
def draw_leaf_v2(cx, cy, w, h, angle_deg, fill_color, check=True):
    """부드러운 잎 형태 + 체크마크"""
    leaf = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    ld = ImageDraw.Draw(leaf)

    # 잎 본체 (타원)
    ld.ellipse([cx-w//2, cy-h//2, cx+w//2, cy+h//2], fill=fill_color)

    # 잎 끝 (위쪽 뾰족)
    tip_h = int(h * 0.25)
    ld.polygon([
        (cx, cy - h//2 - tip_h),
        (cx - int(w*0.22), cy - h//2 + int(h*0.08)),
        (cx + int(w*0.22), cy - h//2 + int(h*0.08)),
    ], fill=fill_color)

    # 잎 끝 (아래쪽 살짝 뾰족)
    btip_h = int(h * 0.12)
    ld.polygon([
        (cx, cy + h//2 + btip_h),
        (cx - int(w*0.15), cy + h//2 - int(h*0.05)),
        (cx + int(w*0.15), cy + h//2 - int(h*0.05)),
    ], fill=fill_color)

    # 잎맥 (중앙 라인) - 미세하게
    vein_color = (255, 255, 255, 40)
    ld.line([(cx, cy - h//2 + 10), (cx, cy + h//2 - 10)], fill=vein_color, width=3)

    # 체크마크
    if check:
        cs = min(w, h) * 0.28
        check_color = (255, 255, 255, 230)
        lw = max(8, int(cs * 0.22))
        pts = [
            (cx - cs*0.38, cy + cs*0.05),
            (cx - cs*0.02, cy + cs*0.38),
            (cx + cs*0.45, cy - cs*0.28),
        ]
        ld.line(pts, fill=check_color, width=lw)
        # 둥근 끝
        for p in pts:
            pr = lw // 2
            ld.ellipse([p[0]-pr, p[1]-pr, p[0]+pr, p[1]+pr], fill=check_color)

    # 회전
    rotated = leaf.rotate(angle_deg, center=(cx, cy), resample=Image.BICUBIC)
    return rotated

# 잎 1: 좌하단 (작은 잎, 연한 그린) - 줄기의 좌측에서 뻗어나옴
leaf1 = draw_leaf_v2(370, 590, 115, 155, angle_deg=40,
                     fill_color=(168, 230, 207, 240), check=True)
img = Image.alpha_composite(img, leaf1)

# 잎 2: 우중단 (중간 잎) - 줄기의 우측에서 뻗어나옴
leaf2 = draw_leaf_v2(660, 470, 140, 185, angle_deg=-32,
                     fill_color=(123, 212, 160, 245), check=True)
img = Image.alpha_composite(img, leaf2)

# 잎 3: 상단 (큰 잎, 진한 그린) - 줄기 상단에서 위로
leaf3 = draw_leaf_v2(490, 300, 165, 220, angle_deg=8,
                     fill_color=(81, 207, 102, 255), check=True)
img = Image.alpha_composite(img, leaf3)

# === 하단 도트 3개 (진행도 표시) ===
draw = ImageDraw.Draw(img)
dot_y = 860
dot_positions = [440, 512, 584]
dot_r = 16

# 도트 1: 연한 (1/3 진행)
draw.ellipse([dot_positions[0]-dot_r, dot_y-dot_r,
              dot_positions[0]+dot_r, dot_y+dot_r],
             fill=(168, 230, 207, 200))

# 도트 2: 중간
draw.ellipse([dot_positions[1]-dot_r, dot_y-dot_r,
              dot_positions[1]+dot_r, dot_y+dot_r],
             fill=(123, 212, 160, 220))

# 도트 3: 진한
draw.ellipse([dot_positions[2]-dot_r, dot_y-dot_r,
              dot_positions[2]+dot_r, dot_y+dot_r],
             fill=(81, 207, 102, 240))

# 미세한 외곽선
draw.rounded_rectangle([2, 2, SIZE-3, SIZE-3], radius=corner_r,
                       outline=(220, 210, 200, 30), width=2)

img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_A_v2_sprout.png', 'PNG')
print("Concept A v2 saved!")
