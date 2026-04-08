"""모든 컨셉을 다양한 크기로 프리뷰 생성"""
from PIL import Image, ImageDraw, ImageFont

SIZE = 1024
PREVIEW_W = 1400
PREVIEW_H = 900

preview = Image.new('RGB', (PREVIEW_W, PREVIEW_H), (245, 245, 245))
draw = ImageDraw.Draw(preview)

# 컨셉 파일들
concepts = [
    ('A: 세 잎 새싹', 'concept_A_final.png'),
    ('B: 세 도장', 'concept_B_final.png'),
    ('C: 별자리 물방울', 'concept_C_final.png'),
]

sizes = [29, 40, 60, 120, 180]
base = '/Users/daniel/Documents/minimal-habit-tracker/assets/icon_concepts/'

try:
    font = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 22)
    font_sm = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 16)
except:
    font = ImageFont.load_default()
    font_sm = font

y_start = 60
row_height = 260

for ci, (name, fname) in enumerate(concepts):
    y = y_start + ci * row_height

    # 라벨
    draw.text((20, y + 5), name, fill=(50, 50, 50), font=font)

    x = 250
    icon = Image.open(base + fname).convert('RGBA')

    for sz in sizes:
        # 리사이즈
        small = icon.resize((sz, sz), Image.LANCZOS)

        # 배경 (체크무늬 대신 흰색)
        bg = Image.new('RGBA', (sz, sz), (255, 255, 255, 255))
        composite = Image.alpha_composite(bg, small).convert('RGB')

        # 중앙 맞춤으로 배치
        cx = x + 90
        cy = y + 120
        px = cx - sz // 2
        py = cy - sz // 2

        preview.paste(composite, (px, py))

        # 크기 라벨
        label = f"{sz}px"
        draw.text((cx - 15, cy + sz//2 + 8), label, fill=(120, 120, 120), font=font_sm)

        x += 200

preview.save(base + 'preview_all_sizes.png', 'PNG')
print("Preview saved!")
