"""
컨셉 C 최종: "별자리 물방울" (Constellation Drops)
===================================================
v2 대비 개선:
- 하이라이트(반사) 색상 수정 (어두운 점 → 밝은 반사로)
- 체크마크 위치/크기 최적화
- 물방울 꼭짓점을 더 부드럽게
- 전체적으로 요소 크기와 간격 재조정
"""

from PIL import Image, ImageDraw
import math, random

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
draw = ImageDraw.Draw(img)
cr = 220

# === 배경 ===
for y in range(SIZE):
    t = y/SIZE
    r = int(22 + (18-22)*t)
    g = int(22 + (18-22)*t)
    b = int(40 + (35-40)*t)
    draw.line([(0,y),(SIZE,y)], fill=(r,g,b,255))

mask = Image.new('L', (SIZE,SIZE), 0)
ImageDraw.Draw(mask).rounded_rectangle([0,0,SIZE-1,SIZE-1], radius=cr, fill=255)
img = Image.composite(img, Image.new('RGBA',(SIZE,SIZE),(0,0,0,0)), mask)
draw = ImageDraw.Draw(img)

# 별 (절제)
random.seed(42)
for _ in range(20):
    sx, sy = random.randint(80,SIZE-80), random.randint(80,SIZE-80)
    sr = random.choice([1,1,2])
    draw.ellipse([sx-sr,sy-sr,sx+sr,sy+sr], fill=(255,255,255,random.randint(15,45)))

# === 위치 ===
d1 = (512, 300)   # 상단
d2 = (320, 630)   # 좌하
d3 = (704, 630)   # 우하

# 연결선
for p1, p2 in [(d1,d2),(d1,d3),(d2,d3)]:
    draw.line([p1,p2], fill=(255,255,255,22), width=2)
    mx,my = (p1[0]+p2[0])//2, (p1[1]+p2[1])//2
    draw.ellipse([mx-2,my-2,mx+2,my+2], fill=(255,255,255,35))

# === 물방울 ===
def draw_drop_final(img, cx, cy, size, color, has_check=False):
    ov = Image.new('RGBA',(SIZE,SIZE),(0,0,0,0))
    od = ImageDraw.Draw(ov)

    body_cy = cy + int(size*0.12)

    # 글로우
    for i in range(18,0,-1):
        a = int(6*(18-i)/18)
        gr = size + i*4
        od.ellipse([cx-gr,body_cy-gr,cx+gr,body_cy+gr], fill=(color[0],color[1],color[2],a))

    # 몸체
    od.ellipse([cx-size, body_cy-size, cx+size, body_cy+size], fill=color)

    # 꼭짓점 (부드러운 삼각형)
    tip_h = int(size*0.85)
    tip_w = int(size*0.42)
    od.polygon([
        (cx, cy - tip_h),
        (cx-tip_w, body_cy - int(size*0.6)),
        (cx+tip_w, body_cy - int(size*0.6)),
    ], fill=color)

    # 꼭짓점-몸체 연결 (부드러운 전환)
    for t in range(8):
        tt = t/8
        ty = (cy-tip_h) + (body_cy-size*0.6 - (cy-tip_h))*tt
        tw = tip_w*(0.2 + 0.8*tt)
        od.ellipse([cx-tw, ty-size*0.08, cx+tw, ty+size*0.08], fill=color)

    # 밝은 반사 (왼쪽 상단, 흰색 반투명)
    hl_cx = cx - size*0.28
    hl_cy = body_cy - size*0.3
    hl_r = size*0.18
    od.ellipse([hl_cx-hl_r, hl_cy-hl_r, hl_cx+hl_r, hl_cy+hl_r],
               fill=(255,255,255,45))

    hl2_r = size*0.09
    hl2_cx = cx - size*0.12
    hl2_cy = body_cy - size*0.5
    od.ellipse([hl2_cx-hl2_r, hl2_cy-hl2_r, hl2_cx+hl2_r, hl2_cy+hl2_r],
               fill=(255,255,255,55))

    # 체크마크
    if has_check:
        cs = size*0.5
        lw = max(10, int(size*0.1))
        pts = [
            (cx-cs*0.38, body_cy+cs*0.05),
            (cx-cs*0.02, body_cy+cs*0.4),
            (cx+cs*0.48, body_cy-cs*0.3),
        ]
        od.line(pts, fill=(255,255,255,245), width=lw)
        for p in pts:
            pr = lw//2
            od.ellipse([p[0]-pr,p[1]-pr,p[0]+pr,p[1]+pr], fill=(255,255,255,245))

    return Image.alpha_composite(img, ov)

# 좌하 블루
img = draw_drop_final(img, d2[0], d2[1], 90, (74,144,217,215))
# 우하 코랄
img = draw_drop_final(img, d3[0], d3[1], 90, (255,168,120,215))
# 상단 그린 (메인)
img = draw_drop_final(img, d1[0], d1[1], 120, (81,207,102,240), has_check=True)

# 외곽
draw = ImageDraw.Draw(img)
draw.rounded_rectangle([2,2,SIZE-3,SIZE-3], radius=cr, outline=(255,255,255,12), width=2)

img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_C_final.png', 'PNG')
print("Concept C final saved!")
