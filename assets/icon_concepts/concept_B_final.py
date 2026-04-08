"""
컨셉 B 최종: "세 개의 부드러운 도장" (Three Soft Stamps)
========================================================
v2 대비 개선:
- 도트 점선 제거 (산만함)
- 연결선 제거 (너무 얇아서 산만)
- 도장 상태를 더 명확하게: 빈 원 / 반채움 / 완전 채움+체크
- 삼각형 구도 유지하되 더 중앙 밀착
- 글로우 효과를 상단 2개에도 미세하게
"""

from PIL import Image, ImageDraw
import math

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# === 배경 ===
cr = 220
for y in range(SIZE):
    t = y / SIZE
    r, g, b = 255, int(246+4*t), int(235+7*t)
    draw.line([(0,y),(SIZE,y)], fill=(r,g,b,255))

mask = Image.new('L', (SIZE, SIZE), 0)
ImageDraw.Draw(mask).rounded_rectangle([0,0,SIZE-1,SIZE-1], radius=cr, fill=255)
bg_flat = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
img = Image.composite(img, bg_flat, mask)
draw = ImageDraw.Draw(img)

# === 도장 3개: 역삼각형 구도 ===
cx, cy = 512, 480
spread = 155
positions = [
    (cx - spread, cy - int(spread*0.5)),  # 좌상
    (cx + spread, cy - int(spread*0.5)),  # 우상
    (cx, cy + int(spread*1.05)),           # 하단
]
sr = 100  # stamp radius

# --- 도장 1: 빈 원 (미완료) ---
s1x, s1y = positions[0]
draw.ellipse([s1x-sr, s1y-sr, s1x+sr, s1y+sr], outline=(74,144,217,55), width=5)
draw.ellipse([s1x-sr+6, s1y-sr+6, s1x+sr-6, s1y+sr-6], fill=(74,144,217,10))

# --- 도장 2: 채움 진행 중 (블루 반투명) ---
s2x, s2y = positions[1]
draw.ellipse([s2x-sr, s2y-sr, s2x+sr, s2y+sr], outline=(74,144,217,100), width=5)
draw.ellipse([s2x-sr+6, s2y-sr+6, s2x+sr-6, s2y+sr-6], fill=(74,144,217,40))

# 절반 채우기 효과 (하단부만 더 진하게)
half_layer = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
hd = ImageDraw.Draw(half_layer)
# 하단 반원
hd.pieslice([s2x-sr+8, s2y-sr+8, s2x+sr-8, s2y+sr-8],
            start=0, end=180, fill=(74,144,217,50))
img = Image.alpha_composite(img, half_layer)
draw = ImageDraw.Draw(img)

# --- 도장 3: 완성 (그린 + 체크) ---
s3x, s3y = positions[2]

# 글로우
for i in range(20, 0, -1):
    a = int(7 * (20-i)/20)
    gr = sr + i*3
    draw.ellipse([s3x-gr, s3y-gr, s3x+gr, s3y+gr], fill=(81,207,102, a))

# 외곽 링
draw.ellipse([s3x-sr-6, s3y-sr-6, s3x+sr+6, s3y+sr+6],
             outline=(81,207,102,50), width=3)

# 메인 원
draw.ellipse([s3x-sr, s3y-sr, s3x+sr, s3y+sr], fill=(81,207,102,255))

# 밝은 내부 (입체)
draw.ellipse([s3x-sr+10, s3y-sr+14, s3x+sr-10, s3y+sr-6],
             fill=(95,215,115,255))

# 체크마크
cs = sr * 0.5
lw = 13
pts = [
    (s3x - cs*0.4, s3y + cs*0.05),
    (s3x - cs*0.02, s3y + cs*0.42),
    (s3x + cs*0.5, s3y - cs*0.32),
]
draw.line(pts, fill=(255,255,255,250), width=lw)
for p in pts:
    pr = lw//2
    draw.ellipse([p[0]-pr, p[1]-pr, p[0]+pr, p[1]+pr], fill=(255,255,255,250))

# 외곽
draw.rounded_rectangle([2,2,SIZE-3,SIZE-3], radius=cr, outline=(210,200,190,25), width=2)

img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_B_final.png', 'PNG')
print("Concept B final saved!")
