"""
컨셉 B: "세 개의 부드러운 도장" (Three Soft Stamps)
=====================================================

비주얼 설명:
- 배경: 그라데이션 라운드 사각형, 연한 피치~크림 (#FFF0E8 → #FFF8F0)
- 중앙 요소: 세 개의 원형 도장이 대각선으로 배치
  - 도장 1 (좌상): 빈 원(미완료 느낌), 연한 블루 테두리 #4A90D9 20%
  - 도장 2 (중앙): 반쯤 채워진 원, 중간 블루 #4A90D9 60%
  - 도장 3 (우하): 완전히 채워진 원 + 체크마크, 그린 #51CF66
- 도장들 사이에 점선 연결 (진행 방향)
- 전체 느낌: 도장찍기/스탬프 콜렉팅 감성
- 오른쪽 하단의 완성 도장이 살짝 더 크고 빛남

색상 팔레트:
- 배경: #FFF0E8 → #FFF8F0
- 도장1 테두리: #4A90D9 alpha 50
- 도장2: #4A90D9 alpha 150
- 도장3: #51CF66 + 글로우
- 체크마크: #FFFFFF
- 연결 점선: #D4C5B9

크기 비율:
- 도장1: 180px
- 도장2: 210px
- 도장3: 250px
- 체크마크: 도장3의 45%
"""

from PIL import Image, ImageDraw, ImageFont
import math

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# === 배경 ===
corner_r = 220

# 그라데이션 배경
for y in range(SIZE):
    t = y / SIZE
    r = int(255 + (255 - 255) * t)
    g = int(240 + (248 - 240) * t)
    b = int(232 + (240 - 232) * t)
    draw.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))

# 라운드 마스크 적용
mask = Image.new('L', (SIZE, SIZE), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([0, 0, SIZE-1, SIZE-1], radius=corner_r, fill=255)
bg_flat = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
img = Image.composite(img, bg_flat, mask)
draw = ImageDraw.Draw(img)

# === 연결 점선 (도장 사이) ===
dash_color = (212, 197, 185, 120)  # #D4C5B9

def draw_dashed_line(draw, start, end, color, width=4, dash_len=16, gap_len=12):
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    length = math.sqrt(dx*dx + dy*dy)
    if length == 0:
        return
    ux, uy = dx/length, dy/length
    pos = 0
    while pos < length:
        seg_end = min(pos + dash_len, length)
        x1 = start[0] + ux * pos
        y1 = start[1] + uy * pos
        x2 = start[0] + ux * seg_end
        y2 = start[1] + uy * seg_end
        draw.line([(x1, y1), (x2, y2)], fill=color, width=width)
        pos += dash_len + gap_len

# 도장 위치
stamp1_pos = (320, 340)    # 좌상
stamp2_pos = (512, 512)    # 중앙
stamp3_pos = (700, 680)    # 우하

draw_dashed_line(draw, stamp1_pos, stamp2_pos, dash_color, width=5)
draw_dashed_line(draw, stamp2_pos, stamp3_pos, dash_color, width=5)

# === 도장 1: 빈 원 (미완료) ===
s1_r = 90
draw.ellipse([
    stamp1_pos[0]-s1_r, stamp1_pos[1]-s1_r,
    stamp1_pos[0]+s1_r, stamp1_pos[1]+s1_r
], outline=(74, 144, 217, 70), width=6)

# 안쪽에 연한 채우기
draw.ellipse([
    stamp1_pos[0]-s1_r+6, stamp1_pos[1]-s1_r+6,
    stamp1_pos[0]+s1_r-6, stamp1_pos[1]+s1_r-6
], fill=(74, 144, 217, 15))

# === 도장 2: 반쯤 채워진 원 ===
s2_r = 105
# 테두리
draw.ellipse([
    stamp2_pos[0]-s2_r, stamp2_pos[1]-s2_r,
    stamp2_pos[0]+s2_r, stamp2_pos[1]+s2_r
], outline=(74, 144, 217, 140), width=6)

# 반쯤 채움 (하단 절반)
half_fill = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
hf_draw = ImageDraw.Draw(half_fill)
hf_draw.ellipse([
    stamp2_pos[0]-s2_r+8, stamp2_pos[1]-s2_r+8,
    stamp2_pos[0]+s2_r-8, stamp2_pos[1]+s2_r-8
], fill=(74, 144, 217, 60))

# 상단 절반을 투명하게 (사각형으로 덮어서 자름)
hf_draw.rectangle([
    stamp2_pos[0]-s2_r-10, stamp2_pos[1]-s2_r-10,
    stamp2_pos[0]+s2_r+10, stamp2_pos[1]
], fill=(0, 0, 0, 0))
img = Image.alpha_composite(img, half_fill)
draw = ImageDraw.Draw(img)

# === 도장 3: 완성 도장 (글로우 + 체크) ===
s3_r = 125

# 글로우 효과
for i in range(20, 0, -1):
    glow_alpha = int(8 * (20 - i) / 20)
    draw.ellipse([
        stamp3_pos[0]-s3_r-i*3, stamp3_pos[1]-s3_r-i*3,
        stamp3_pos[0]+s3_r+i*3, stamp3_pos[1]+s3_r+i*3
    ], fill=(81, 207, 102, glow_alpha))

# 메인 원
draw.ellipse([
    stamp3_pos[0]-s3_r, stamp3_pos[1]-s3_r,
    stamp3_pos[0]+s3_r, stamp3_pos[1]+s3_r
], fill=(81, 207, 102, 255))

# 안쪽 살짝 밝은 원 (입체감)
inner_r = s3_r - 15
draw.ellipse([
    stamp3_pos[0]-inner_r, stamp3_pos[1]-inner_r+5,
    stamp3_pos[0]+inner_r, stamp3_pos[1]+inner_r+5
], fill=(91, 217, 112, 255))

# 체크마크 ✓
check_size = s3_r * 0.55
cx, cy = stamp3_pos
check_pts = [
    (cx - check_size*0.4, cy + check_size*0.05),
    (cx - check_size*0.05, cy + check_size*0.4),
    (cx + check_size*0.5, cy - check_size*0.35),
]
draw.line(check_pts, fill=(255, 255, 255, 255), width=14)
# 둥근 끝 처리
for pt in check_pts:
    draw.ellipse([pt[0]-7, pt[1]-7, pt[0]+7, pt[1]+7], fill=(255, 255, 255, 255))

# === 숫자 표시 (도장 안에 작게) ===
try:
    font_small = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf', 48)
    font_medium = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf', 56)
except:
    font_small = ImageFont.load_default()
    font_medium = font_small

# 도장1 안에 "1"
draw.text((stamp1_pos[0]-12, stamp1_pos[1]-28), "1", fill=(74, 144, 217, 80), font=font_small)

# 도장2 안에 "2"
draw.text((stamp2_pos[0]-14, stamp2_pos[1]-32), "2", fill=(74, 144, 217, 160), font=font_medium)

# === 미세한 테두리 ===
draw.rounded_rectangle([2, 2, SIZE-3, SIZE-3], radius=corner_r, outline=(200, 190, 180, 40), width=2)

img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_B_stamps.png', 'PNG')
print("Concept B saved!")
