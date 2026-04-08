"""
컨셉 C 최종2: 하이라이트 버그 수정
- 반투명 흰색이 검정으로 보이는 문제 해결: 배경이 있는 상태에서 그리기
- 물방울을 불투명하게 만들고 그 위에 하이라이트 적용
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
    r,g,b = int(22+(18-22)*t), int(22+(18-22)*t), int(40+(35-40)*t)
    draw.line([(0,y),(SIZE,y)], fill=(r,g,b,255))

mask = Image.new('L', (SIZE,SIZE), 0)
ImageDraw.Draw(mask).rounded_rectangle([0,0,SIZE-1,SIZE-1], radius=cr, fill=255)
img = Image.composite(img, Image.new('RGBA',(SIZE,SIZE),(0,0,0,0)), mask)
draw = ImageDraw.Draw(img)

# 별
random.seed(42)
for _ in range(20):
    sx,sy = random.randint(80,SIZE-80), random.randint(80,SIZE-80)
    sr = random.choice([1,1,2])
    draw.ellipse([sx-sr,sy-sr,sx+sr,sy+sr], fill=(255,255,255,random.randint(15,45)))

# 위치
d1 = (512, 300)
d2 = (320, 630)
d3 = (704, 630)

# 연결선
for p1,p2 in [(d1,d2),(d1,d3),(d2,d3)]:
    draw.line([p1,p2], fill=(255,255,255,22), width=2)
    mx,my = (p1[0]+p2[0])//2, (p1[1]+p2[1])//2
    draw.ellipse([mx-2,my-2,mx+2,my+2], fill=(255,255,255,35))

# === 물방울 (버그 수정 버전) ===
def draw_drop_fixed(img, cx, cy, size, color_rgb, has_check=False):
    """물방울을 img 위에 직접 그림 (alpha compositing 문제 회피)"""
    draw = ImageDraw.Draw(img)
    body_cy = cy + int(size*0.12)
    color = (*color_rgb, 255)  # 불투명

    # 글로우
    for i in range(18,0,-1):
        a = int(6*(18-i)/18)
        gr = size + i*4
        draw.ellipse([cx-gr,body_cy-gr,cx+gr,body_cy+gr],
                     fill=(color_rgb[0],color_rgb[1],color_rgb[2],a))

    # 몸체
    draw.ellipse([cx-size, body_cy-size, cx+size, body_cy+size], fill=color)

    # 꼭짓점
    tip_h = int(size*0.85)
    tip_w = int(size*0.42)
    draw.polygon([
        (cx, cy - tip_h),
        (cx-tip_w, body_cy - int(size*0.6)),
        (cx+tip_w, body_cy - int(size*0.6)),
    ], fill=color)

    # 연결부 부드럽게
    for t in range(8):
        tt = t/8
        ty = (cy-tip_h) + (body_cy-size*0.6-(cy-tip_h))*tt
        tw = tip_w*(0.2+0.8*tt)
        draw.ellipse([cx-tw, ty-size*0.08, cx+tw, ty+size*0.08], fill=color)

    # 하이라이트 (밝은 버전의 색상으로)
    hl_r = int(color_rgb[0]*0.3+255*0.7)
    hl_g = int(color_rgb[1]*0.3+255*0.7)
    hl_b = int(color_rgb[2]*0.3+255*0.7)
    highlight = (hl_r, hl_g, hl_b, 255)

    hx = cx - size*0.28
    hy = body_cy - size*0.3
    hr = size*0.16
    draw.ellipse([hx-hr, hy-hr, hx+hr, hy+hr], fill=highlight)

    hx2 = cx - size*0.12
    hy2 = body_cy - size*0.48
    hr2 = size*0.08
    draw.ellipse([hx2-hr2, hy2-hr2, hx2+hr2, hy2+hr2], fill=(min(hl_r+20,255), min(hl_g+20,255), min(hl_b+20,255), 255))

    # 체크마크
    if has_check:
        cs = size*0.5
        lw = max(10, int(size*0.1))
        pts = [
            (cx-cs*0.38, body_cy+cs*0.05),
            (cx-cs*0.02, body_cy+cs*0.4),
            (cx+cs*0.48, body_cy-cs*0.3),
        ]
        draw.line(pts, fill=(255,255,255,255), width=lw)
        for p in pts:
            pr = lw//2
            draw.ellipse([p[0]-pr,p[1]-pr,p[0]+pr,p[1]+pr], fill=(255,255,255,255))

    return img

# 좌하 블루
img = draw_drop_fixed(img, d2[0], d2[1], 90, (74,144,217))
# 우하 코랄
img = draw_drop_fixed(img, d3[0], d3[1], 90, (255,168,120))
# 상단 그린 (메인)
img = draw_drop_fixed(img, d1[0], d1[1], 120, (81,207,102), has_check=True)

# 외곽
draw = ImageDraw.Draw(img)
draw.rounded_rectangle([2,2,SIZE-3,SIZE-3], radius=cr, outline=(255,255,255,12), width=2)

img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_C_final.png', 'PNG')
print("Concept C final2 saved!")
