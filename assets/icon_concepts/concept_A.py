"""
컨셉 A: "세 잎 새싹" (Three Leaf Sprout)
=========================================

비주얼 설명:
- 배경: 부드러운 라운드 사각형, 웜 크림 화이트 (#FFF8F0)
- 중앙 요소: 땅에서 올라오는 새싹 하나, 잎이 3장
  - 줄기: 부드러운 곡선, 앱 블루 (#4A90D9)에서 그린(#51CF66)으로 그라데이션
  - 잎 3장: 좌/우/상 방향, 각각 다른 크기로 성장 표현
    - 첫 번째 잎(좌하): 작은 크기, 연한 그린 #A8E6CF
    - 두 번째 잎(우중): 중간 크기, 중간 그린 #7BD4A0
    - 세 번째 잎(상): 큰 크기, 진한 그린 #51CF66
  - 각 잎에 작은 체크마크(✓) 흰색으로 내부에 표시
- 줄기 하단에 작은 점 3개 (도트) → 도장/진행률 느낌
- 전체적으로 부드러운 곡선, 라운드 처리

색상 팔레트:
- 배경: #FFF8F0 (웜 크림)
- 잎1: #A8E6CF → 체크 시 #51CF66
- 잎2: #7BD4A0
- 잎3: #51CF66
- 줄기: #4A90D9
- 체크마크: #FFFFFF
- 도트: #4A90D9 30% opacity

크기 비율 (1024x1024 기준):
- 배경 라운드: 전체, corner radius 220px
- 새싹 전체: 중앙 60% 영역 (약 614px)
- 잎 크기: 소 120px, 중 160px, 대 200px
- 체크마크: 잎 내부 40% 크기
"""

from PIL import Image, ImageDraw, ImageFont
import math

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# === 배경: 라운드 사각형 ===
bg_color = (255, 248, 240, 255)  # #FFF8F0
corner_r = 220
draw.rounded_rectangle([0, 0, SIZE-1, SIZE-1], radius=corner_r, fill=bg_color)

# === 미세한 그림자/글로우 효과를 위한 서브틀한 원형 배경 ===
glow_color = (81, 207, 102, 15)  # 매우 연한 그린 글로우
draw.ellipse([200, 200, 824, 824], fill=glow_color)

# === 줄기 (부드러운 곡선) ===
stem_color = (74, 144, 217, 255)  # #4A90D9
stem_width = 28

# 줄기: 아래에서 위로 부드러운 S곡선
# 베지어 곡선을 점들로 근사
def bezier_curve(points, num_steps=100):
    """3차 베지어 곡선"""
    result = []
    for t_i in range(num_steps + 1):
        t = t_i / num_steps
        x = (1-t)**3 * points[0][0] + 3*(1-t)**2*t * points[1][0] + 3*(1-t)*t**2 * points[2][0] + t**3 * points[3][0]
        y = (1-t)**3 * points[0][1] + 3*(1-t)**2*t * points[1][1] + 3*(1-t)*t**2 * points[2][1] + t**3 * points[3][1]
        result.append((x, y))
    return result

# 줄기 경로
stem_points = bezier_curve([
    (512, 780),   # 시작 (하단)
    (490, 620),   # 제어점1
    (530, 480),   # 제어점2
    (512, 340),   # 끝 (상단)
], num_steps=80)

# 줄기 그리기 (두꺼운 선)
for i in range(len(stem_points) - 1):
    # 그라데이션: 아래(블루) → 위(그린)
    t = i / len(stem_points)
    r = int(74 + (81 - 74) * t)
    g = int(144 + (207 - 144) * t)
    b = int(217 + (102 - 217) * t)
    color = (r, g, b, 255)
    x1, y1 = stem_points[i]
    x2, y2 = stem_points[i + 1]
    draw.line([(x1, y1), (x2, y2)], fill=color, width=stem_width)

# 줄기 끝을 둥글게
draw.ellipse([stem_points[0][0]-14, stem_points[0][1]-14,
              stem_points[0][0]+14, stem_points[0][1]+14],
             fill=(74, 144, 217, 255))

# === 잎 그리기 함수 ===
def draw_leaf(draw, cx, cy, width, height, angle, color, check_color=(255, 255, 255, 255)):
    """타원형 잎을 그린 뒤 체크마크 추가"""
    # 잎을 별도 이미지로 그린 뒤 회전
    leaf_img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    leaf_draw = ImageDraw.Draw(leaf_img)

    # 잎 모양: 타원 + 끝이 뾰족한 형태를 타원으로 근사
    leaf_draw.ellipse([
        cx - width//2, cy - height//2,
        cx + width//2, cy + height//2
    ], fill=color)

    # 잎 끝 뾰족하게 (삼각형 추가)
    tip_size = width // 3
    leaf_draw.polygon([
        (cx, cy - height//2 - tip_size//2),
        (cx - tip_size//2, cy - height//2 + tip_size//3),
        (cx + tip_size//2, cy - height//2 + tip_size//3),
    ], fill=color)

    # 체크마크 (✓) 그리기
    check_size = min(width, height) * 0.3
    check_cx, check_cy = cx, cy
    check_points = [
        (check_cx - check_size*0.4, check_cy),
        (check_cx - check_size*0.1, check_cy + check_size*0.35),
        (check_cx + check_size*0.45, check_cy - check_size*0.3),
    ]
    leaf_draw.line(check_points, fill=check_color, width=max(6, int(check_size * 0.18)))

    # 회전
    rotated = leaf_img.rotate(angle, center=(cx, cy), resample=Image.BICUBIC)
    return rotated

# === 잎 1: 좌하 (작은 잎, 성장 초기) ===
leaf1_color = (168, 230, 207, 255)  # #A8E6CF
leaf1 = draw_leaf(draw=None, cx=380, cy=560, width=120, height=170, angle=35, color=leaf1_color)
img = Image.alpha_composite(img, leaf1)

# === 잎 2: 우중 (중간 잎) ===
leaf2_color = (123, 212, 160, 255)  # #7BD4A0
leaf2 = draw_leaf(draw=None, cx=650, cy=460, width=150, height=200, angle=-30, color=leaf2_color)
img = Image.alpha_composite(img, leaf2)

# === 잎 3: 상단 (큰 잎, 완성) ===
leaf3_color = (81, 207, 102, 255)  # #51CF66
leaf3 = draw_leaf(draw=None, cx=500, cy=310, width=180, height=240, angle=5, color=leaf3_color)
img = Image.alpha_composite(img, leaf3)

# === 하단 도트 3개 (진행률/도장 느낌) ===
draw = ImageDraw.Draw(img)
dot_y = 860
dot_colors = [
    (74, 144, 217, 180),   # 블루 반투명
    (74, 144, 217, 180),
    (74, 144, 217, 180),
]
dot_positions = [430, 512, 594]
dot_r = 18

for i, (dx, dc) in enumerate(zip(dot_positions, dot_colors)):
    # 채워진 도트 (도장 느낌)
    draw.ellipse([dx-dot_r, dot_y-dot_r, dx+dot_r, dot_y+dot_r], fill=dc)

# === 미세한 외곽선 ===
draw.rounded_rectangle([2, 2, SIZE-3, SIZE-3], radius=corner_r, outline=(200, 190, 180, 40), width=2)

# 저장
img.save('/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/concept_A_sprout.png', 'PNG')
print("Concept A saved!")
