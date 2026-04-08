"""
컨셉 C: "세 개의 부드러운 물방울 체크" (Three Soft Drop Checks)
================================================================

비주얼 설명:
- 배경: 딥 네이비에 가까운 다크 (#1A1A2E → #0D0D1A), 라운드
  - 앱의 다크 테마 (#0D0D0D)를 살리되, 순수 검정이 아닌 약간 따뜻한 다크
- 중앙 요소: 물방울/방울 형태 3개가 삼각형 구도로 배치
  - 상단 중앙: 큰 방울, 앱 그린 #51CF66, 체크마크 포함
  - 좌하: 중간 방울, 앱 블루 #4A90D9
  - 우하: 중간 방울, 연한 코랄/피치 #FFB088 (따뜻한 포인트)
- 각 방울은 물방울 형태 (상단 뾰족, 하단 둥근)
- 방울들 사이에 미세한 빛 연결선 (constellation/별자리 느낌)
- 전체 느낌: 감성적인 다크 테마, 별자리처럼 연결된 습관들

색상 팔레트:
- 배경: #1A1A2E → #14142B
- 방울1(상): #51CF66 (그린)
- 방울2(좌하): #4A90D9 (블루)
- 방울3(우하): #FFB088 (코랄)
- 빛 연결선: #FFFFFF alpha 30
- 체크마크: #FFFFFF
- 미세한 별/글리터: #FFFFFF alpha 40

차별점:
- 다크 테마 아이콘은 한국 앱스토어에서 드물어서 시선 집중
- 별자리 연결 느낌 → 감성적 + 습관 연결이라는 메타포
- 세 가지 색상 = 세 가지 습관의 다양성
"""

from PIL import Image, ImageDraw, ImageFont
import math, random

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# === 배경: 다크 그라데이션 ===
corner_r = 220

for y in range(SIZE):
    t = y / SIZE
    r = int(26 + (20 - 26) * t)
    g = int(26 + (20 - 26) * t)
    b = int(46 + (43 - 46) * t)
    draw.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))

# 라운드 마스크
mask = Image.new('L', (SIZE, SIZE), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([0, 0, SIZE-1, SIZE-1], radius=corner_r, fill=255)
bg_flat = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
img = Image.composite(img, bg_flat, mask)
draw = ImageDraw.Draw(img)

# === 미세한 별/글리터 효과 ===
random.seed(42)  # 재현성
for _ in range(40):
    sx = random.randint(80, SIZE-80)
    sy = random.randint(80, SIZE-80)
    sr = random.randint(1, 3)
    sa = random.randint(15, 50)
    draw.ellipse([sx-sr, sy-sr, sx+sr, sy+sr], fill=(255, 255, 255, sa))

# === 물방울 위치 (삼각형 구도) ===
drop1_pos = (512, 300)    # 상단 중앙 (메인, 큰)
drop2_pos = (320, 620)    # 좌하
drop3_pos = (704, 620)    # 우하

# === 연결선 (별자리 느낌) ===
line_color = (255, 255, 255, 35)
draw.line([drop1_pos, drop2_pos], fill=line_color, width=3)
draw.line([drop1_pos, drop3_pos], fill=line_color, width=3)
draw.line([drop2_pos, drop3_pos], fill=line_color, width=3)

# 연결선 중간에 작은 점
for p1, p2 in [(drop1_pos, drop2_pos), (drop1_pos, drop3_pos), (drop2_pos, drop3_pos)]:
    mx = (p1[0] + p2[0]) // 2
    my = (p1[1] + p2[1]) // 2
    draw.ellipse([mx-4, my-4, mx+4, my+4], fill=(255, 255, 255, 50))

# === 물방울 그리기 함수 ===
def draw_drop(img, cx, cy, size, color, has_check=False):
    """물방울 형태: 상단 뾰족 + 하단 둥근"""
    overlay = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)

    # 글로우
    for i in range(15, 0, -1):
        ga = int(6 * (15-i) / 15)
        od.ellipse([
            cx-size-i*4, cy-size+size//4-i*4,
            cx+size+i*4, cy+size+size//4+i*4
        ], fill=(color[0], color[1], color[2], ga))

    # 하단 큰 원
    body_r = size
    body_cy = cy + size // 4
    od.ellipse([cx-body_r, body_cy-body_r, cx+body_r, body_cy+body_r], fill=color)

    # 상단 뾰족 (삼각형)
    tip_height = size * 0.9
    od.polygon([
        (cx, cy - tip_height),
        (cx - size * 0.55, body_cy - body_r * 0.5),
        (cx + size * 0.55, body_cy - body_r * 0.5),
    ], fill=color)

    # 하이라이트 (왼쪽 상단에 밝은 반사)
    hl_r = size * 0.25
    hl_cx = cx - size * 0.25
    hl_cy = body_cy - size * 0.2
    od.ellipse([hl_cx-hl_r, hl_cy-hl_r, hl_cx+hl_r, hl_cy+hl_r],
               fill=(255, 255, 255, 50))

    # 체크마크
    if has_check:
        check_s = size * 0.45
        check_cy_offset = body_cy
        pts = [
            (cx - check_s*0.4, check_cy_offset),
            (cx - check_s*0.05, check_cy_offset + check_s*0.35),
            (cx + check_s*0.5, check_cy_offset - check_s*0.3),
        ]
        od.line(pts, fill=(255, 255, 255, 240), width=max(8, int(size*0.08)))
        for pt in pts:
            od.ellipse([pt[0]-4, pt[1]-4, pt[0]+4, pt[1]+4], fill=(255, 255, 255, 240))

    return Image.alpha_composite(img, overlay)

# === 방울 3개 그리기 ===
# 방울 2 (좌하, 블루)
img = draw_drop(img, drop2_pos[0], drop2_pos[1], 100, (74, 144, 217, 230))

# 방울 3 (우하, 코랄)
img = draw_drop(img, drop3_pos[0], drop3_pos[1], 100, (255, 176, 136, 230))

# 방울 1 (상단, 그린 - 메인, 더 큼)
img = draw_drop(img, drop1_pos[0], drop1_pos[1], 130, (81, 207, 102, 240), has_check=True)

# === 하단에 작은 텍스트 없이, 연결점에 글로우 ===
draw = ImageDraw.Draw(img)
for pos in [drop1_pos, drop2_pos, drop3_pos]:
    # 연결점 강조
    draw.ellipse([pos[0]-6, pos[1]-6, pos[0]+6, pos[1]+6], fill=(255, 255, 255, 60))

# === 미세한 테두리 ===
draw.rounded_rectangle([2, 2, SIZE-3, SIZE-3], radius=corner_r, outline=(255, 255, 255, 20), width=2)

img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_C_drops.png', 'PNG')
print("Concept C saved!")
