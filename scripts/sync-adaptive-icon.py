#!/usr/bin/env python3
"""
icon.png(iOS 마스터)를 기반으로 Android adaptive-icon.png 재생성.

두 가지 모드:
  --keep-bg : icon.png의 cream 라운딩 사각형 배경을 그대로 유지하고 축소
  --strip-bg: cream 픽셀을 투명으로 치환 → 식물+점 도안만 남김 (Android 시스템 cream과 자연스럽게 합쳐짐)

기본은 --strip-bg.
"""
import argparse
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "icon.png")
DST = os.path.join(ROOT, "assets", "adaptive-icon.png")

CANVAS = 1024
SAFE_RATIO = 0.72

CREAM_RGB = (255, 248, 240)  # app.json android.adaptiveIcon.backgroundColor
CREAM_TOL = 18  # 채널별 차이 허용치


def strip_cream(img: Image.Image) -> Image.Image:
    """cream에 가까운 픽셀의 alpha를 0으로 — PIL의 point/getdata 기반."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    cr, cg, cb = CREAM_RGB
    tol = CREAM_TOL
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if (
                abs(r - cr) <= tol
                and abs(g - cg) <= tol
                and abs(b - cb) <= tol
            ):
                px[x, y] = (r, g, b, 0)
    return img


def main() -> None:
    parser = argparse.ArgumentParser()
    grp = parser.add_mutually_exclusive_group()
    grp.add_argument("--keep-bg", action="store_const", dest="mode", const="keep")
    grp.add_argument("--strip-bg", action="store_const", dest="mode", const="strip")
    parser.set_defaults(mode="strip")
    args = parser.parse_args()

    src = Image.open(SRC).convert("RGBA")
    if src.size != (CANVAS, CANVAS):
        src = src.resize((CANVAS, CANVAS), Image.LANCZOS)

    if args.mode == "strip":
        src = strip_cream(src)
        print("[mode] cream 배경 투명 처리")
    else:
        print("[mode] icon.png 원본 그대로 유지")

    target_size = int(CANVAS * SAFE_RATIO)
    scaled = src.resize((target_size, target_size), Image.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    offset = (CANVAS - target_size) // 2
    canvas.paste(scaled, (offset, offset), scaled)

    canvas.save(DST, "PNG", optimize=True)
    print(f"✓ adaptive-icon.png 재생성 ({target_size}px / {CANVAS}px, 점유율 {SAFE_RATIO*100:.0f}%)")
    print(f"  → {DST}")


if __name__ == "__main__":
    main()
