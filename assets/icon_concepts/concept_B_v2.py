"""
컨셉 B v2: "세 개의 도장" 개선판
=================================
개선 사항:
- 중앙 정렬된 삼각형 구도 (좌상/우상/하단)
- 숫자 제거 → 진행 상태만으로 표현
- 도장 크기 균일화 (약간의 크기 차이만)
- 점선 제거 → 더 클린하게
- 세 번째 도장에 부드러운 애니메이션 느낌 (링 효과)
- 전체 밸런스 대폭 개선
"""

from PIL import Image, ImageDraw, ImageFont
import math

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# === 배경: 따뜻한 크림 ===
corner_r = 220

# 미세 그라데이션
for y in range(SIZE):
    t = y / SIZE
    r = 255
    g = int(246 + (250 - 246) * t)
    b = int(235 + (242 - 235) * t)
    draw.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))

# 라운드 마스크
mask = Image.new('L', (SIZE, SIZE), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([0, 0, SIZE-1, SIZE-1], radius=corner_r, fill=255)
bg_flat = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
img = Image.composite(img, bg_flat, mask)
draw = ImageDraw.Draw(img)

# === 삼각형 구도로 도장 3개 배치 ===
# 정삼각형에 가깝게, 중앙 정렬
cx, cy = 512, 490  # 전체 중심 (약간 위)
spread = 170  # 삼각형 크기

stamp_positions = [
    (cx - spread, cy - int(spread * 0.6)),   # 좌상
    (cx + spread, cy - int(spread * 0.6)),   # 우상
    (cx, cy + int(spread * 1.0)),             # 하단 중앙
]

stamp_r = 105  # 도장 반지름 (균일)

# === 도장 1: 빈 원 (대기 상태) ===
s1x, s1y = stamp_positions[0]
# 테두리만
draw.ellipse([s1x-stamp_r, s1y-stamp_r, s1x+stamp_r, s1y+stamp_r],
             outline=(74, 144, 217, 50), width=5)
# 매우 연한 채우기
draw.ellipse([s1x-stamp_r+5, s1y-stamp_r+5, s1x+stamp_r-5, s1y+stamp_r-5],
             fill=(74, 144, 217, 12))
# 점선 원 (도장 가이드 느낌)
for angle in range(0, 360, 15):
    rad = math.radians(angle)
    inner_r = stamp_r - 20
    dx = s1x + inner_r * math.cos(rad)
    dy = s1y + inner_r * math.sin(rad)
    if angle % 30 == 0:
        draw.ellipse([dx-2.5, dy-2.5, dx+2.5, dy+2.5], fill=(74, 144, 217, 35))

# === 도장 2: 반투명 채움 (진행 중) ===
s2x, s2y = stamp_positions[1]
draw.ellipse([s2x-stamp_r, s2y-stamp_r, s2x+stamp_r, s2y+stamp_r],
             outline=(74, 144, 217, 100), width=5)
draw.ellipse([s2x-stamp_r+5, s2y-stamp_r+5, s2x+stamp_r-5, s2y+stamp_r-5],
             fill=(74, 144, 217, 45))

# 내부에 연한 체크마크 (진행 중 표시)
cs = stamp_r * 0.4
ck_pts = [
    (s2x - cs*0.38, s2y + cs*0.05),
    (s2x - cs*0.02, s2y + cs*0.35),
    (s2x + cs*0.45, s2y - cs*0.25),
]
draw.line(ck_pts, fill=(74, 144, 217, 80), width=8)

# === 도장 3: 완성 (그린 + 체크 + 링 효과) ===
s3x, s3y = stamp_positions[2]

# 외부 링 글로우 (성취감 효과)
for i in range(25, 0, -1):
    ga = int(6 * (25 - i) / 25)
    r_glow = stamp_r + i * 3
    draw.ellipse([s3x-r_glow, s3y-r_glow, s3x+r_glow, s3y+r_glow],
                 fill=(81, 207, 102, ga))

# 링 (도장 테두리 느낌)
draw.ellipse([s3x-stamp_r-8, s3y-stamp_r-8, s3x+stamp_r+8, s3y+stamp_r+8],
             outline=(81, 207, 102, 60), width=4)

# 메인 채움
draw.ellipse([s3x-stamp_r, s3y-stamp_r, s3x+stamp_r, s3y+stamp_r],
             fill=(81, 207, 102, 255))

# 살짝 밝은 내부 (입체감)
draw.ellipse([s3x-stamp_r+8, s3y-stamp_r+12, s3x+stamp_r-8, s3y+stamp_r-4],
             fill=(95, 215, 115, 255))

# 체크마크 (굵고 명확하게)
cs3 = stamp_r * 0.48
lw = 14
ck3_pts = [
    (s3x - cs3*0.4, s3y + cs3*0.05),
    (s3x - cs3*0.02, s3y + cs3*0.42),
    (s3x + cs3*0.5, s3y - cs3*0.32),
]
draw.line(ck3_pts, fill=(255, 255, 255, 250), width=lw)
for p in ck3_pts:
    pr = lw // 2
    draw.ellipse([p[0]-pr, p[1]-pr, p[0]+pr, p[1]+pr], fill=(255, 255, 255, 250))

# === 도장 사이의 미세한 연결 (별자리 느낌, 아주 옅게) ===
conn_color = (74, 144, 217, 18)
draw.line([stamp_positions[0], stamp_positions[1]], fill=conn_color, width=2)
draw.line([stamp_positions[1], stamp_positions[2]], fill=conn_color, width=2)
draw.line([stamp_positions[0], stamp_positions[2]], fill=conn_color, width=2)

# 외곽선
draw.rounded_rectangle([2, 2, SIZE-3, SIZE-3], radius=corner_r,
                       outline=(220, 210, 200, 30), width=2)

img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_B_v2_stamps.png', 'PNG')
print("Concept B v2 saved!")
