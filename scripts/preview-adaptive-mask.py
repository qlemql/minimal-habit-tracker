#!/usr/bin/env python3
"""
Android adaptive icon이 실제 런처에서 어떻게 렌더링될지 시뮬레이션.
3가지 마스크(원/스퀴어클/라운드 정사각)를 적용해 미리보기 PNG 생성.
"""
from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FG = os.path.join(ROOT, "assets", "adaptive-icon.png")
OUT = os.path.join(ROOT, "/tmp/adaptive-preview.png")

CANVAS = 1024
BG_COLOR = (255, 248, 240, 255)  # #FFF8F0 — app.json android.adaptiveIcon.backgroundColor


def composite_layers() -> Image.Image:
    """배경 cream 채우고 그 위에 foreground PNG 합성."""
    base = Image.new("RGBA", (CANVAS, CANVAS), BG_COLOR)
    fg = Image.open(FG).convert("RGBA")
    if fg.size != (CANVAS, CANVAS):
        fg = fg.resize((CANVAS, CANVAS), Image.LANCZOS)
    base.paste(fg, (0, 0), fg)
    return base


def circle_mask(size: int) -> Image.Image:
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).ellipse([0, 0, size, size], fill=255)
    return m


def squircle_mask(size: int, corner_ratio: float = 0.40) -> Image.Image:
    r = int(size * corner_ratio)
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)
    return m


def rounded_square_mask(size: int, corner_ratio: float = 0.18) -> Image.Image:
    r = int(size * corner_ratio)
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)
    return m


def main() -> None:
    composed = composite_layers()
    masks = [
        ("circle (Pixel)", circle_mask(CANVAS)),
        ("squircle (Galaxy)", squircle_mask(CANVAS, 0.40)),
        ("rounded sq (구버전 런처)", rounded_square_mask(CANVAS, 0.18)),
    ]

    # 가로 3장 + 라벨 띠 (라벨은 Pillow 기본 폰트 의존성 회피 위해 생략, 콘솔 출력으로 안내)
    tile = 360
    gap = 30
    out_w = tile * 3 + gap * 4
    out_h = tile + gap * 2
    canvas = Image.new("RGBA", (out_w, out_h), (245, 245, 245, 255))

    for i, (label, mask) in enumerate(masks):
        masked = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        masked.paste(composed, (0, 0), mask)
        thumb = masked.resize((tile, tile), Image.LANCZOS)
        canvas.paste(thumb, (gap + i * (tile + gap), gap), thumb)
        print(f"  {i+1}. {label}")

    canvas.save(OUT, "PNG")
    print(f"\n✓ 미리보기 저장: {OUT}")


if __name__ == "__main__":
    main()
