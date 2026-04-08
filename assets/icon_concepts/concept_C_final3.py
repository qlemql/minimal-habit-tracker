"""
컨셉 C 최종3: 글로우 과다 수정, 물방울 형태 복원
- 글로우를 대폭 축소 (물방울 형태가 보여야 함)
- 하이라이트를 작고 미세하게
- 꼭짓점을 더 뾰족하고 명확하게
- 체크마크 위치 최적화
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

# 별 (절제)
random.seed(42)
for _ in range(18):
    sx,sy = random.randint(90,SIZE-90), random.randint(90,SIZE-90)
    sr = random.choice([1,1,2])
    draw.ellipse([sx-sr,sy-sr,sx+sr,sy+sr], fill=(255,255,255,random.randint(20,50)))

# 위치
d1 = (512, 310)   # 상단 (메인)
d2 = (315, 640)   # 좌하
d3 = (709, 640)   # 우하

# 연결선 (별자리)
for p1,p2 in [(d1,d2),(d1,d3),(d2,d3)]:
    draw.line([p1,p2], fill=(255,255,255,25), width=2)
    mx,my = (p1[0]+p2[0])//2, (p1[1]+p2[1])//2
    draw.ellipse([mx-2,my-2,mx+2,my+2], fill=(255,255,255,40))

def draw_drop_v3(img, cx, cy, size, color_rgb, has_check=False):
    draw = ImageDraw.Draw(img)
    body_cy = cy + int(size * 0.15)

    # 미세한 글로우만 (작게)
    for i in range(8, 0, -1):
        a = int(4 * (8-i) / 8)
        gr = size + i * 2
        draw.ellipse([cx-gr, body_cy-gr, cx+gr, body_cy+gr],
                     fill=(color_rgb[0], color_rgb[1], color_rgb[2], a))

    # 몸체 원
    draw.ellipse([cx-size, body_cy-size, cx+size, body_cy+size],
                 fill=(*color_rgb, 255))

    # 꼭짓점 (뾰족하게)
    tip_h = int(size * 1.0)
    tip_w = int(size * 0.38)
    # 메인 삼각형
    draw.polygon([
        (cx, cy - tip_h),
        (cx - tip_w, body_cy - int(size * 0.65)),
        (cx + tip_w, body_cy - int(size * 0.65)),
    ], fill=(*color_rgb, 255))

    # 삼각형-원 연결 (부드럽게 타원으로 채움)
    for t in range(10):
        tt = t / 10
        top_y = cy - tip_h
        bot_y = body_cy - size * 0.65
        ty = top_y + (bot_y - top_y) * tt
        tw = tip_w * (0.15 + 0.85 * tt)
        th = size * 0.06
        draw.ellipse([cx-tw, ty-th, cx+tw, ty+th], fill=(*color_rgb, 255))

    # 약간 밝은 내부 (입체감) - 불투명 색상
    lighter = (min(color_rgb[0]+20, 255), min(color_rgb[1]+20, 255), min(color_rgb[2]+20, 255))
    inner_r = int(size * 0.7)
    draw.ellipse([cx-inner_r, body_cy-inner_r+int(size*0.1),
                  cx+inner_r, body_cy+inner_r-int(size*0.15)],
                 fill=(*lighter, 255))

    # 하이라이트: 작은 밝은 점 (불투명, 물방울 반사 느낌)
    hl_color = (min(color_rgb[0]+80, 255), min(color_rgb[1]+80, 255), min(color_rgb[2]+80, 255))
    hr = int(size * 0.1)
    hx = cx - int(size * 0.25)
    hy = body_cy - int(size * 0.35)
    draw.ellipse([hx-hr, hy-hr, hx+hr, hy+hr], fill=(*hl_color, 255))

    # 더 작은 하이라이트
    hr2 = int(size * 0.05)
    hx2 = cx - int(size * 0.1)
    hy2 = body_cy - int(size * 0.52)
    draw.ellipse([hx2-hr2, hy2-hr2, hx2+hr2, hy2+hr2],
                 fill=(min(hl_color[0]+30,255), min(hl_color[1]+30,255), min(hl_color[2]+30,255), 255))

    # 체크마크
    if has_check:
        cs = size * 0.45
        lw = max(10, int(size * 0.09))
        # 체크마크를 몸체 중앙에 배치
        ck_cy = body_cy + int(size * 0.05)
        pts = [
            (cx - cs*0.38, ck_cy + cs*0.02),
            (cx - cs*0.02, ck_cy + cs*0.38),
            (cx + cs*0.48, ck_cy - cs*0.32),
        ]
        draw.line(pts, fill=(255,255,255,255), width=lw)
        for p in pts:
            pr = lw // 2
            draw.ellipse([p[0]-pr, p[1]-pr, p[0]+pr, p[1]+pr], fill=(255,255,255,255))

    return img

# 좌하 블루
img = draw_drop_v3(img, d2[0], d2[1], 88, (74, 144, 217))
# 우하 코랄
img = draw_drop_v3(img, d3[0], d3[1], 88, (255, 168, 120))
# 상단 그린 (메인, 더 큼)
img = draw_drop_v3(img, d1[0], d1[1], 115, (81, 207, 102), has_check=True)

# 연결점 강조
draw = ImageDraw.Draw(img)
for pos in [d1, d2, d3]:
    draw.ellipse([pos[0]-4, pos[1]-4, pos[0]+4, pos[1]+4], fill=(255,255,255,45))

# 외곽
draw.rounded_rectangle([2,2,SIZE-3,SIZE-3], radius=cr, outline=(255,255,255,12), width=2)

img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_C_final.png', 'PNG')
print("Concept C final3 saved!")
