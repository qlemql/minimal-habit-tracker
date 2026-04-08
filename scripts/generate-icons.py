#!/usr/bin/env python3
"""
싹 - 습관 트래커 — App Icon & Splash Generator
3개의 체크 원 = 브랜드 아이덴티티
더 세련된 미니멀 디자인으로 리디자인
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import os

ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets')

# Brand colors
BG_COLOR = (13, 13, 13)  # #0D0D0D
COLORS = [
    (99, 163, 235),   # Blue  #63A3EB
    (150, 120, 211),  # Purple #9678D3
    (72, 209, 130),   # Green #48D182
]
# Darker ring colors (for depth)
RING_COLORS = [
    (55, 100, 155),
    (90, 65, 145),
    (35, 135, 75),
]


def draw_check(draw, cx, cy, radius, color=(255, 255, 255), thickness=None):
    """Draw a clean checkmark inside a circle area."""
    if thickness is None:
        thickness = max(3, int(radius * 0.14))

    # Checkmark proportions relative to radius
    scale = radius * 0.48
    # Start, corner, end points of checkmark
    sx = cx - scale * 0.35
    sy = cy + scale * 0.05
    mx = cx - scale * 0.05
    my = cy + scale * 0.38
    ex = cx + scale * 0.45
    ey = cy - scale * 0.35

    # Draw thick checkmark lines
    for offset in range(-thickness // 2, thickness // 2 + 1):
        draw.line([(sx, sy + offset), (mx, my + offset)], fill=color, width=1)
        draw.line([(mx, my + offset), (ex, ey + offset)], fill=color, width=1)

    # Smoother: draw with width parameter
    draw.line([(sx, sy), (mx, my)], fill=color, width=thickness)
    draw.line([(mx, my), (ex, ey)], fill=color, width=thickness)


def draw_circle_with_ring(draw, cx, cy, radius, fill_color, ring_color, ring_width=None):
    """Draw a filled circle with a subtle outer ring for depth."""
    if ring_width is None:
        ring_width = max(2, int(radius * 0.08))

    # Outer ring
    draw.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        fill=ring_color
    )
    # Inner filled circle
    inner_r = radius - ring_width
    draw.ellipse(
        [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
        fill=fill_color
    )


def generate_icon(size=1024, padding_ratio=0.18):
    """Generate the main app icon — 3 vertical check circles."""
    # Work at 2x for antialiasing, then downscale
    work_size = size * 2
    img = Image.new('RGBA', (work_size, work_size), BG_COLOR + (255,))
    draw = ImageDraw.Draw(img)

    padding = int(work_size * padding_ratio)
    usable = work_size - padding * 2

    # 3 circles stacked vertically with gaps
    circle_radius = int(usable * 0.18)
    gap = int(circle_radius * 0.40)
    total_height = circle_radius * 6 + gap * 2
    start_y = (work_size - total_height) // 2 + circle_radius

    cx = work_size // 2

    for i, (color, ring_color) in enumerate(zip(COLORS, RING_COLORS)):
        cy = start_y + i * (circle_radius * 2 + gap)

        # Subtle glow behind circle
        glow_img = Image.new('RGBA', (work_size, work_size), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_img)
        glow_r = int(circle_radius * 1.15)
        glow_draw.ellipse(
            [cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r],
            fill=color + (30,)
        )
        glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=circle_radius * 0.3))
        img = Image.alpha_composite(img, glow_img)
        draw = ImageDraw.Draw(img)

        # Circle with ring
        draw_circle_with_ring(draw, cx, cy, circle_radius, color, ring_color)

        # Checkmark
        check_thickness = max(4, int(circle_radius * 0.13))
        draw_check(draw, cx, cy, circle_radius, (255, 255, 255, 230), check_thickness)

    # Downscale with antialiasing
    img = img.resize((size, size), Image.LANCZOS)
    return img


def generate_adaptive_icon(size=1024):
    """
    Android adaptive icon foreground.
    Safe zone is the inner 66% circle, so we need more padding.
    """
    work_size = size * 2
    img = Image.new('RGBA', (work_size, work_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Adaptive icons have safe zone = 66% of canvas
    # Place content within inner ~60% to be safe
    padding_ratio = 0.22
    padding = int(work_size * padding_ratio)
    usable = work_size - padding * 2

    circle_radius = int(usable * 0.20)
    gap = int(circle_radius * 0.30)
    total_height = circle_radius * 6 + gap * 2
    start_y = (work_size - total_height) // 2 + circle_radius

    cx = work_size // 2

    for i, (color, ring_color) in enumerate(zip(COLORS, RING_COLORS)):
        cy = start_y + i * (circle_radius * 2 + gap)

        # Glow
        glow_img = Image.new('RGBA', (work_size, work_size), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_img)
        glow_r = int(circle_radius * 1.15)
        glow_draw.ellipse(
            [cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r],
            fill=color + (25,)
        )
        glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=circle_radius * 0.3))
        img = Image.alpha_composite(img, glow_img)
        draw = ImageDraw.Draw(img)

        draw_circle_with_ring(draw, cx, cy, circle_radius, color, ring_color)
        check_thickness = max(4, int(circle_radius * 0.13))
        draw_check(draw, cx, cy, circle_radius, (255, 255, 255, 230), check_thickness)

    img = img.resize((size, size), Image.LANCZOS)
    return img


def generate_splash(size=1024):
    """
    Splash icon — slightly smaller 3 circles, clean and centered.
    """
    work_size = size * 2
    img = Image.new('RGBA', (work_size, work_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Smaller circles for splash (more breathing room)
    circle_radius = int(work_size * 0.08)
    gap = int(circle_radius * 0.40)
    total_height = circle_radius * 6 + gap * 2
    start_y = (work_size - total_height) // 2 + circle_radius

    cx = work_size // 2

    for i, (color, ring_color) in enumerate(zip(COLORS, RING_COLORS)):
        cy = start_y + i * (circle_radius * 2 + gap)

        # Subtle glow
        glow_img = Image.new('RGBA', (work_size, work_size), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_img)
        glow_r = int(circle_radius * 1.2)
        glow_draw.ellipse(
            [cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r],
            fill=color + (20,)
        )
        glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=circle_radius * 0.4))
        img = Image.alpha_composite(img, glow_img)
        draw = ImageDraw.Draw(img)

        draw_circle_with_ring(draw, cx, cy, circle_radius, color, ring_color)
        check_thickness = max(3, int(circle_radius * 0.13))
        draw_check(draw, cx, cy, circle_radius, (255, 255, 255, 230), check_thickness)

    img = img.resize((size, size), Image.LANCZOS)
    return img


def generate_favicon(size=48):
    """Simplified favicon — single center circle or 3 tiny dots."""
    work_size = size * 4
    img = Image.new('RGBA', (work_size, work_size), BG_COLOR + (255,))
    draw = ImageDraw.Draw(img)

    # 3 small filled circles (no rings at this size)
    circle_radius = int(work_size * 0.13)
    gap = int(circle_radius * 0.25)
    total_height = circle_radius * 6 + gap * 2
    start_y = (work_size - total_height) // 2 + circle_radius
    cx = work_size // 2

    for i, color in enumerate(COLORS):
        cy = start_y + i * (circle_radius * 2 + gap)
        draw.ellipse(
            [cx - circle_radius, cy - circle_radius, cx + circle_radius, cy + circle_radius],
            fill=color
        )
        # Simple check at small size
        check_thickness = max(2, int(circle_radius * 0.18))
        draw_check(draw, cx, cy, circle_radius, (255, 255, 255), check_thickness)

    img = img.resize((size, size), Image.LANCZOS)
    return img


if __name__ == '__main__':
    print("Generating app icons...")

    # Main icon (iOS + general)
    icon = generate_icon(1024)
    icon.save(os.path.join(ASSETS_DIR, 'icon.png'), 'PNG')
    print("  ✓ icon.png (1024x1024)")

    # Android adaptive icon foreground
    adaptive = generate_adaptive_icon(1024)
    adaptive.save(os.path.join(ASSETS_DIR, 'adaptive-icon.png'), 'PNG')
    print("  ✓ adaptive-icon.png (1024x1024)")

    # Splash icon
    splash = generate_splash(1024)
    splash.save(os.path.join(ASSETS_DIR, 'splash-icon.png'), 'PNG')
    print("  ✓ splash-icon.png (1024x1024)")

    # Favicon
    favicon = generate_favicon(48)
    favicon.save(os.path.join(ASSETS_DIR, 'favicon.png'), 'PNG')
    print("  ✓ favicon.png (48x48)")

    print("\nDone! All icons generated in assets/")
