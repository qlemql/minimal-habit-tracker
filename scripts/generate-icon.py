"""
Minimal Habit Tracker — App Icon Generator
미니멀 체크마크 + "3" 컨셉
배경: 다크(#0D0D0D), 둥근 체크마크 3개
"""
from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 1024
BG_COLOR = (13, 13, 13)  # #0D0D0D
ACCENT = (74, 144, 217)  # #4A90D9

output_dir = os.path.join(os.path.dirname(__file__), '..', 'assets')

def draw_icon():
    img = Image.new('RGBA', (SIZE, SIZE), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # 3개의 체크 원 (세로 배치)
    circle_colors = [
        (74, 144, 217),   # 블루
        (123, 104, 238),  # 퍼플
        (81, 207, 102),   # 그린
    ]

    center_x = SIZE // 2
    circle_r = 100
    gap = 260
    start_y = SIZE // 2 - gap

    for i, color in enumerate(circle_colors):
        cy = start_y + i * gap
        # 원 배경 (살짝 투명한 색)
        bg_color = tuple(list(color) + [40])
        draw.ellipse(
            [center_x - circle_r - 20, cy - circle_r - 20,
             center_x + circle_r + 20, cy + circle_r + 20],
            fill=tuple(c // 4 for c in color)
        )
        # 메인 원
        draw.ellipse(
            [center_x - circle_r, cy - circle_r,
             center_x + circle_r, cy + circle_r],
            fill=color
        )
        # 체크마크 (✓)
        check_size = 50
        lw = 14
        # 체크마크 좌표
        x1 = center_x - check_size + 5
        y1 = cy + 5
        x2 = center_x - 10
        y2 = cy + check_size - 10
        x3 = center_x + check_size - 5
        y3 = cy - check_size + 15
        draw.line([(x1, y1), (x2, y2)], fill='white', width=lw)
        draw.line([(x2, y2), (x3, y3)], fill='white', width=lw)

    return img

# 메인 아이콘 (1024x1024)
icon = draw_icon()
icon.save(os.path.join(output_dir, 'icon.png'))

# 적응형 아이콘 (Android)
icon.save(os.path.join(output_dir, 'adaptive-icon.png'))

# 스플래시 아이콘 (중앙 작게)
splash = Image.new('RGBA', (SIZE, SIZE), BG_COLOR)
small_icon = icon.resize((400, 400), Image.LANCZOS)
offset = (SIZE - 400) // 2
splash.paste(small_icon, (offset, offset), small_icon)
splash.save(os.path.join(output_dir, 'splash-icon.png'))

# 파비콘
favicon = icon.resize((48, 48), Image.LANCZOS)
favicon.save(os.path.join(output_dir, 'favicon.png'))

print("✅ Icons generated:")
print("  - assets/icon.png (1024x1024)")
print("  - assets/adaptive-icon.png (1024x1024)")
print("  - assets/splash-icon.png (1024x1024)")
print("  - assets/favicon.png (48x48)")
