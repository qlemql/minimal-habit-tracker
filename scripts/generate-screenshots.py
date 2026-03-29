"""
App Store 스크린샷 프레임 생성
6.7인치 (1290x2796) — iPhone 15 Pro Max 기준
배경 + 텍스트 오버레이 + 목업 영역
"""
from PIL import Image, ImageDraw, ImageFont
import os

output_dir = os.path.join(os.path.dirname(__file__), '..', 'assets', 'screenshots')
os.makedirs(output_dir, exist_ok=True)

W, H = 1290, 2796
BG = (13, 13, 13)
WHITE = (255, 255, 255)
GRAY = (153, 153, 153)
BLUE = (74, 144, 217)

SCREENS = [
    {
        "title": "딱 3개만\n집중하세요",
        "subtitle": "적게 추적할수록 더 잘 지킵니다",
        "accent": (74, 144, 217),
    },
    {
        "title": "원탭으로\n체크 완료",
        "subtitle": "앱을 열고 5초면 끝",
        "accent": (81, 207, 102),
    },
    {
        "title": "스트릭으로\n동기부여",
        "subtitle": "연속 달성 기록이 습관을 만듭니다",
        "accent": (255, 107, 107),
    },
    {
        "title": "한눈에 보는\n주간 현황",
        "subtitle": "이번 주 달성률을 확인하세요",
        "accent": (123, 104, 238),
    },
    {
        "title": "다크 모드\n기본 제공",
        "subtitle": "아침에도 밤에도 편안하게",
        "accent": (255, 146, 43),
    },
]

for i, screen in enumerate(SCREENS):
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)

    # 상단 악센트 바
    draw.rectangle([0, 0, W, 8], fill=screen["accent"])

    # 타이틀 (큰 텍스트 - 폰트 없이 위치만 잡음)
    title_y = 300
    for line in screen["title"].split("\n"):
        # 텍스트 크기 근사치
        text_w = len(line) * 80
        x = (W - text_w) // 2
        draw.text((x, title_y), line, fill=WHITE)
        title_y += 120

    # 서브타이틀
    sub_w = len(screen["subtitle"]) * 35
    draw.text(((W - sub_w) // 2, title_y + 40), screen["subtitle"], fill=GRAY)

    # 스크린샷 자리 표시 (둥근 사각형 영역)
    mock_margin = 120
    mock_top = 800
    mock_bottom = H - 200
    draw.rounded_rectangle(
        [mock_margin, mock_top, W - mock_margin, mock_bottom],
        radius=40,
        fill=(26, 26, 26),
        outline=(38, 38, 38),
        width=2
    )

    # 안내 텍스트
    guide = "시뮬레이터 스크린샷을 여기에 합성"
    gw = len(guide) * 22
    gy = (mock_top + mock_bottom) // 2
    draw.text(((W - gw) // 2, gy), guide, fill=(102, 102, 102))

    filename = f"screenshot_{i+1}.png"
    img.save(os.path.join(output_dir, filename))

print(f"✅ {len(SCREENS)} screenshot frames generated in assets/screenshots/")
print("   시뮬레이터 캡처 후 목업 영역에 합성하면 완성")
