"""
컨셉 A Refined v2: "세 잎 새싹" 최종 정제 버전
================================================

## 최종 디자인 스펙

### 1. 색상 팔레트
| 요소          | Hex       | RGB               | 용도                |
|--------------|-----------|-------------------|---------------------|
| 배경          | #FFF8F0   | (255,248,240)     | 따뜻한 크림          |
| 줄기 하단     | #5A9E8F   | (90,158,143)      | 블루그린 (시작점)     |
| 줄기 상단     | #3D8B6A   | (61,139,106)      | 딥그린 (성장)        |
| 잎1 (좌하)   | #B8E8D0   | (184,232,208)     | 연한 민트 (1단계)    |
| 잎2 (우중)   | #6ED4A0   | (110,212,160)     | 밝은 그린 (2단계)    |
| 잎3 (상단)   | #3EBF6B   | (62,191,107)      | 선명 그린 (3단계)    |
| 체크마크      | #FFFFFF   | (255,255,255)     | 90% opacity         |
| 도트 3색      | —         | 잎과 동일          | 진행도 표현          |

### 2. 비율 (1024x1024 기준)
- 새싹 전체: 중앙 66% 영역 (170~854px) — Android safe zone 준수
- 줄기: x=512 중심, y=750→300, 두께 18→9px 테이퍼
- 잎1: cx=350, cy=560, 130x175px, 42° 회전
- 잎2: cx=680, cy=430, 160x215px, -34° 회전
- 잎3: cx=495, cy=250, 190x255px, 5° 회전
- 체크마크: 잎3 중앙, 크기 65px, 두께 16px
- 도트: y=865, 간격 72px, 반지름 16px

### 3. 스타일 가이드
- 줄기: 베지어 S자 곡선, 16→8px 테이퍼링
- 잎: 부드러운 타원 + 뾰족 끝점, 잎맥 없음 (미니멀)
- 체크마크: 굵고 둥근 끝, 잎 위에 선명하게
- 그림자: 잎 아래 미세 드롭 섀도우 (blur 20px, 8% opacity)
- 글로우: 배경 원형 글로우 (새싹 중심부)
- 잎 하이라이트: 상단 좌측에 미세한 밝은 영역

### 4. 소형 최적화
- 60px: 도트 제거, 체크마크 더 두껍게
- 40px: 잎을 단순 타원으로, 체크마크만 유지
- 29px: 잎 3개 + 줄기만, 체크마크 제거

### 5. 플랫폼 제약
- iOS: 불투명 배경 (알파 채널 없음), 모서리 둥글림 자동 적용
- Android adaptive icon: 핵심 요소가 중앙 66% 안에 위치

### 차별화 (포레스트 등 식물 앱과 구분)
- 잎맥 제거 → 식물 사실감↓, 추상적 심볼감↑
- 체크마크가 "완료"를 명시 → 습관 앱 정체성
- 3단계 그라데이션 = "진행도" → 트래킹 앱 연상
- 따뜻한 크림 배경 → 포레스트(초록/흰색)와 감성 차별화
- 둥글둥글한 미니멀 형태 → 카카오/토스 스타일, MZ세대 감성
"""

from PIL import Image, ImageDraw, ImageFilter
import math

SIZE = 1024
SCALE = 4  # 4x 슈퍼샘플링
W = SIZE * SCALE

img = Image.new('RGBA', (W, W), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

def s(v):
    """스케일 변환"""
    return int(v * SCALE)

# ============================================================
# 색상 팔레트
# ============================================================
BG_COLOR = (255, 248, 240, 255)
STEM_BOT = (90, 158, 143)
STEM_TOP = (61, 139, 106)
LEAF1_COLOR = (184, 232, 208, 245)    # 연한 민트
LEAF2_COLOR = (110, 212, 160, 250)    # 밝은 그린
LEAF3_COLOR = (62, 191, 107, 255)     # 선명 그린
CHECK_COLOR = (255, 255, 255, 235)
DOT_COLORS = [
    (184, 232, 208, 220),
    (110, 212, 160, 240),
    (62, 191, 107, 255),
]

# ============================================================
# 유틸리티
# ============================================================
def cubic_bezier(p0, p1, p2, p3, steps=300):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3*p0[0] + 3*u**2*t*p1[0] + 3*u*t**2*p2[0] + t**3*p3[0]
        y = u**3*p0[1] + 3*u**2*t*p1[1] + 3*u*t**2*p2[1] + t**3*p3[1]
        pts.append((x, y))
    return pts

def lerp(a, b, t):
    return a + (b - a) * t

# ============================================================
# 1. 배경
# ============================================================
corner_r = s(220)
draw.rounded_rectangle([0, 0, W-1, W-1], radius=corner_r, fill=BG_COLOR)

# 부드러운 원형 글로우
glow_layer = Image.new('RGBA', (W, W), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)
for i in range(60, 0, -1):
    alpha = int(3 * (60 - i) / 60)
    r = s(280) + i * s(5)
    cx, cy = s(512), s(430)
    glow_draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(80, 200, 110, alpha))
img = Image.alpha_composite(img, glow_layer)

# ============================================================
# 2. 줄기 (베지어 곡선, 부드러운 S자)
# ============================================================
stem_layer = Image.new('RGBA', (W, W), (0, 0, 0, 0))
stem_draw = ImageDraw.Draw(stem_layer)

# 줄기를 3개 세그먼트로 분리 (각 분기점에서 자연스럽게 꺾이도록)
# 세그먼트 1: 하단 → 잎1 분기점
seg1 = cubic_bezier(
    (s(512), s(750)), (s(510), s(680)), (s(508), s(630)), (s(507), s(582)),
    steps=200
)
# 세그먼트 2: 잎1 분기 → 잎2 분기
seg2 = cubic_bezier(
    (s(507), s(582)), (s(510), s(530)), (s(515), s(480)), (s(517), s(450)),
    steps=200
)
# 세그먼트 3: 잎2 분기 → 상단
seg3 = cubic_bezier(
    (s(517), s(450)), (s(514), s(400)), (s(510), s(350)), (s(508), s(300)),
    steps=200
)

all_stem = seg1 + seg2 + seg3
total = len(all_stem)

for i, (x, y) in enumerate(all_stem):
    t = i / total
    r = int(lerp(STEM_BOT[0], STEM_TOP[0], t))
    g = int(lerp(STEM_BOT[1], STEM_TOP[1], t))
    b = int(lerp(STEM_BOT[2], STEM_TOP[2], t))
    thickness = lerp(s(9), s(4), t)
    stem_draw.ellipse([x-thickness, y-thickness, x+thickness, y+thickness],
                      fill=(r, g, b, 255))

img = Image.alpha_composite(img, stem_layer)

# ============================================================
# 3. 줄기-잎 연결부 (부드러운 곡선으로 자연스럽게)
# ============================================================
conn_layer = Image.new('RGBA', (W, W), (0, 0, 0, 0))
conn_draw = ImageDraw.Draw(conn_layer)

# 잎1 연결: 줄기에서 좌하로 부드럽게 휘어짐
conn1_pts = cubic_bezier(
    (s(507), s(582)), (s(480), s(578)), (s(440), s(572)), (s(385), s(562)),
    steps=200
)
for i, (x, y) in enumerate(conn1_pts):
    t = i / len(conn1_pts)
    # 줄기 두께에서 점점 가늘어짐
    th = lerp(s(8), s(2.5), t)
    r = int(lerp(STEM_TOP[0], LEAF1_COLOR[0], t**0.7))
    g = int(lerp(STEM_TOP[1], LEAF1_COLOR[1], t**0.7))
    b = int(lerp(STEM_TOP[2], LEAF1_COLOR[2], t**0.7))
    conn_draw.ellipse([x-th, y-th, x+th, y+th], fill=(r, g, b, 255))

# 잎2 연결: 줄기에서 우측으로 부드럽게
conn2_pts = cubic_bezier(
    (s(517), s(450)), (s(555), s(444)), (s(610), s(438)), (s(655), s(432)),
    steps=200
)
for i, (x, y) in enumerate(conn2_pts):
    t = i / len(conn2_pts)
    th = lerp(s(7.5), s(2.5), t)
    r = int(lerp(STEM_TOP[0], LEAF2_COLOR[0], t**0.7))
    g = int(lerp(STEM_TOP[1], LEAF2_COLOR[1], t**0.7))
    b = int(lerp(STEM_TOP[2], LEAF2_COLOR[2], t**0.7))
    conn_draw.ellipse([x-th, y-th, x+th, y+th], fill=(r, g, b, 255))

# 잎3 연결: 줄기 상단이 자연스럽게 잎으로 이어짐
conn3_pts = cubic_bezier(
    (s(508), s(320)), (s(505), s(295)), (s(500), s(275)), (s(495), s(258)),
    steps=120
)
for i, (x, y) in enumerate(conn3_pts):
    t = i / len(conn3_pts)
    th = lerp(s(5), s(1.5), t)
    r = int(lerp(STEM_TOP[0], LEAF3_COLOR[0], t**0.6))
    g = int(lerp(STEM_TOP[1], LEAF3_COLOR[1], t**0.6))
    b = int(lerp(STEM_TOP[2], LEAF3_COLOR[2], t**0.6))
    conn_draw.ellipse([x-th, y-th, x+th, y+th], fill=(r, g, b, 255))

img = Image.alpha_composite(img, conn_layer)

# ============================================================
# 4. 잎 (미니멀, 잎맥 없음)
# ============================================================
def draw_leaf(cx, cy, w, h, angle_deg, fill_color):
    """
    미니멀 잎 — 잎맥 없이 깨끗한 형태
    포레스트 같은 식물 앱이 아닌, 추상적 심볼로서의 잎
    """
    cx, cy, w, h = s(cx), s(cy), s(w), s(h)

    # --- 그림자 ---
    shadow_layer = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_layer)
    sx, sy = cx + s(4), cy + s(6)
    shadow_col = (40, 80, 50, 20)
    sd.ellipse([sx-w//2, sy-h//2, sx+w//2, sy+h//2], fill=shadow_col)
    tip_h = int(h * 0.22)
    tw = int(w * 0.21)
    sd.polygon([
        (sx, sy - h//2 - tip_h),
        (sx - tw, sy - h//2 + int(h*0.07)),
        (sx + tw, sy - h//2 + int(h*0.07)),
    ], fill=shadow_col)
    shadow_layer = shadow_layer.rotate(angle_deg, center=(cx, cy), resample=Image.BICUBIC)
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=s(14)))

    # --- 잎 본체 ---
    leaf = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    ld = ImageDraw.Draw(leaf)

    # 메인 타원
    ld.ellipse([cx-w//2, cy-h//2, cx+w//2, cy+h//2], fill=fill_color)

    # 상단 뾰족 끝
    tip_h = int(h * 0.24)
    tw = int(w * 0.22)
    ld.polygon([
        (cx, cy - h//2 - tip_h),
        (cx - tw, cy - h//2 + int(h*0.08)),
        (cx + tw, cy - h//2 + int(h*0.08)),
    ], fill=fill_color)
    # 이음새 부드럽게
    smooth_r = int(tw * 1.0)
    ld.ellipse([cx - smooth_r, cy - h//2 - int(h*0.01),
                cx + smooth_r, cy - h//2 + int(h*0.13)], fill=fill_color)

    # 하단 약간 뾰족
    btip_h = int(h * 0.11)
    bw = int(w * 0.15)
    ld.polygon([
        (cx, cy + h//2 + btip_h),
        (cx - bw, cy + h//2 - int(h*0.04)),
        (cx + bw, cy + h//2 - int(h*0.04)),
    ], fill=fill_color)
    smooth_rb = int(bw * 1.0)
    ld.ellipse([cx - smooth_rb, cy + h//2 - int(h*0.06),
                cx + smooth_rb, cy + h//2 + int(h*0.03)], fill=fill_color)

    # 하이라이트 (상단 좌측 밝은 영역)
    highlight = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    hd = ImageDraw.Draw(highlight)
    hr_w, hr_h = int(w * 0.40), int(h * 0.35)
    hx, hy = cx - int(w*0.10), cy - int(h*0.15)
    hd.ellipse([hx-hr_w//2, hy-hr_h//2, hx+hr_w//2, hy+hr_h//2],
               fill=(255, 255, 255, 18))
    leaf = Image.alpha_composite(leaf, highlight)

    # 중앙 잎맥 (매우 미세하게, 1줄만)
    vein_layer = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vein_layer)
    vd.line([(cx, cy - h//2 + s(15)), (cx, cy + h//2 - s(10))],
            fill=(255, 255, 255, 22), width=max(1, s(1)))
    leaf = Image.alpha_composite(leaf, vein_layer)

    # 회전
    rotated = leaf.rotate(angle_deg, center=(cx, cy), resample=Image.BICUBIC)

    return shadow_layer, rotated

# 잎 1: 좌하단 (작은, 연한 민트) — 성장 1단계
shadow1, leaf1 = draw_leaf(350, 560, 130, 175, 42, LEAF1_COLOR)
img = Image.alpha_composite(img, shadow1)
img = Image.alpha_composite(img, leaf1)

# 잎 2: 우중단 (중간, 밝은 그린) — 성장 2단계
shadow2, leaf2 = draw_leaf(680, 430, 160, 215, -34, LEAF2_COLOR)
img = Image.alpha_composite(img, shadow2)
img = Image.alpha_composite(img, leaf2)

# 잎 3: 상단 (큰, 선명 그린) — 성장 3단계 (완료)
shadow3, leaf3 = draw_leaf(495, 250, 190, 255, 5, LEAF3_COLOR)
img = Image.alpha_composite(img, shadow3)
img = Image.alpha_composite(img, leaf3)

# ============================================================
# 5. 체크마크 (상단 잎에만, 크고 선명하게)
# ============================================================
check_layer = Image.new('RGBA', (W, W), (0, 0, 0, 0))
cd = ImageDraw.Draw(check_layer)

ck_cx, ck_cy = s(495), s(258)
ck_s = s(62)   # 체크 크기 키움
lw = s(16)     # 선 두께 키움

pts = [
    (ck_cx - ck_s*0.42, ck_cy + ck_s*0.06),
    (ck_cx - ck_s*0.02, ck_cy + ck_s*0.42),
    (ck_cx + ck_s*0.50, ck_cy - ck_s*0.34),
]

# 체크 그림자
shadow_pts = [(p[0]+s(3), p[1]+s(3)) for p in pts]
cd.line(shadow_pts, fill=(20, 70, 40, 40), width=lw+s(6))
for p in shadow_pts:
    pr = (lw+s(6)) // 2
    cd.ellipse([p[0]-pr, p[1]-pr, p[0]+pr, p[1]+pr], fill=(20, 70, 40, 40))

# 체크 본체
cd.line(pts, fill=CHECK_COLOR, width=lw)
for p in pts:
    pr = lw // 2
    cd.ellipse([p[0]-pr, p[1]-pr, p[0]+pr, p[1]+pr], fill=CHECK_COLOR)

# 잎3과 동일 각도로 회전
check_layer = check_layer.rotate(5, center=(s(495), s(250)), resample=Image.BICUBIC)
img = Image.alpha_composite(img, check_layer)

# ============================================================
# 6. 하단 도트 3개
# ============================================================
draw = ImageDraw.Draw(img)
dot_y = s(865)
dot_spacing = s(72)
dot_center_x = s(512)
dot_r = s(16)

for i, color in enumerate(DOT_COLORS):
    dx = dot_center_x + (i - 1) * dot_spacing
    # 미세 그림자
    draw.ellipse([dx-dot_r+s(1), dot_y-dot_r+s(2), dx+dot_r+s(1), dot_y+dot_r+s(2)],
                 fill=(80, 80, 60, 10))
    # 완전히 채워진 도트
    draw.ellipse([dx-dot_r, dot_y-dot_r, dx+dot_r, dot_y+dot_r], fill=color)

# ============================================================
# 7. 내부 광원 (상단에서 아래로 미세한 조명)
# ============================================================
light_layer = Image.new('RGBA', (W, W), (0, 0, 0, 0))
light_draw = ImageDraw.Draw(light_layer)
for i in range(40, 0, -1):
    alpha = int(1.2 * (40 - i) / 40)
    r = s(220) + i * s(4)
    light_draw.ellipse([s(512)-r, s(180)-r, s(512)+r, s(180)+r],
                       fill=(255, 255, 245, alpha))
img = Image.alpha_composite(img, light_layer)

# ============================================================
# 8. 외곽
# ============================================================
draw = ImageDraw.Draw(img)
draw.rounded_rectangle([s(1), s(1), W-s(2), W-s(2)], radius=corner_r,
                       outline=(200, 190, 175, 18), width=max(1, s(1)))

# ============================================================
# 9. 다운스케일 (고품질 LANCZOS)
# ============================================================
img = img.resize((SIZE, SIZE), Image.LANCZOS)

# ============================================================
# 10. 저장 (불투명 배경)
# ============================================================
output_path = '/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_A_refined.png'
final = Image.new('RGBA', (SIZE, SIZE), (255, 248, 240, 255))
final.paste(img, mask=img.split()[3])
final.save(output_path, 'PNG')

print(f"Concept A Refined v2 저장 완료: {output_path}")
print(f"크기: {SIZE}x{SIZE}")
