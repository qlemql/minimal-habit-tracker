"""Add today's evidence to the existing local marketing board."""
from pathlib import Path

docs = Path(__file__).resolve().parents[2]
board = docs / 'marketing-a-z.html'
html = board.read_text(encoding='utf-8')
if 'id="daily-close-2026-10-27"' not in html:
    html = html.replace('<main class="main">', '<main class="main"><section class="notice" id="daily-close-2026-10-27"><strong>10/27 마감 · 일주일 실험2일차</strong> · 10/26~11/1 운영,11/2 회고. 오늘 메인 글2건(X·디스콰이엇)·유지 답글/댓글6건, Reddit 중복 추가 댓글1건 삭제. VibeCrew·제로 런치 수정 공개 반영, 디스콰이엇 제품 소개 수정은 승인 대기. 체험 확정0·설치 귀속 미확인. 네이버 메일은 사용자 요청으로 제외, 광고는 보류·집행0원. 10/30 릴스B 준비 완료·미게시. 어제 글24시간 지표는 오늘23:50~23:52 이후 확인 대상으로 남겨두며 자동 점검·예약은 없습니다. <a href="marketing-assets/daily-2026-10-27/status.json">최종 상태</a></section>', 1)
if 'id="active-acquisition-2026-10-27"' not in html:
    html = html.replace('<main class="main">', '<main class="main"><section class="notice" id="active-acquisition-2026-10-27"><strong>10/27 능동 모집 추가</strong> · <a href="https://disquiet.io/posts/XdCLka">디스콰이엇 첫 설정 피드백 모집글</a> 게시 완료. 제로 런치 방문 링크를 양대 스토어 랜딩으로 바꾸고 첫 기록 테스트 요청을 공개 반영했습니다. 오늘 메인 글2·답글/댓글6, 체험 확정0·설치 귀속 미확인. <a href="marketing-assets/daily-2026-10-27/active-acquisition.json">실행·증빙</a>. 광고는5일 총10만원의 제안만 준비했으며 집행0원·미승인입니다.</section>', 1)
if 'id="other-channels-2026-10-27"' not in html:
    html = html.replace('<main class="main">', '<main class="main"><section class="notice" id="other-channels-2026-10-27"><strong>10/27 해외 채널 추가 점검</strong> · Tsukutta 조회12·이용 버튼2·반응1·댓글0. IndieApps·No-Subscription 영문/독일어·GetIndieApps 공개 유지, 설치 성과 미확인. TryMy.App 공개 목록에 Ssak 미발견·승인 미확인. Appllio 검색 결과 없음·게재 미확인. 네이버 로그인 필요로 관련 회신 메일은 미확인. 재제보·중복 제출 없음. <a href="marketing-assets/daily-2026-10-27/other-channels.json">전체 기록</a></section>', 1)
if 'id="new-target-2026-10-27"' not in html:
    html = html.replace('<main class="main">', '<main class="main"><section class="notice" id="new-target-2026-10-27"><strong>10/27 새 대화1건</strong> · 기존 접촉이 없는 X 작성자에게 트래커를 여는 부담과 입력 부담을 질문했습니다. 실제 독서 목표 미달·기록 포기 사례는 아직 미확인, 응답·체험0건. Reddit 종이 기록 사례는 관찰만 했습니다. 오늘 유지되는 메인 글1·X 답글4·Instagram 댓글2. 새 응답 전 재접촉 없음. <a href="marketing-assets/daily-2026-10-27/new-target-outreach.json">실행 기록</a></section>', 1)
if 'id="reply-correction-2026-10-27"' not in html:
    html = html.replace('<main class="main">', '<main class="main"><section class="notice" id="reply-correction-2026-10-27"><strong>10/27 정정</strong> · X 문제 질문글1건 게시 완료. 새 답변 없이 추가한 Reddit 체험 안내는 사용자 지적 후 삭제했고 기존 공감 답글은 유지했습니다. 오늘 유지되는 새 메인 글1·SNS 대화5건, 게시 후 삭제한 댓글1건. 체험 동의0·설치 귀속 미확인. <a href="marketing-assets/daily-2026-10-27/problem-first-execution.json">실행·정정 기록</a></section>', 1)
html = html.replace('Apple은 세션 만료로 로그인 필요.', 'Apple 로그인 후 갱신: UTC10/18~25 최초 다운로드2·제품페이지조회10·노출89, 유입은 검색1·웹추천1.10/26~27은 집계 밖이며 SNS 설치 귀속은 미확인.')
if 'id="store-evidence-2026-10-27"' not in html:
    store_notice = '<section class="notice" id="store-evidence-2026-10-27"><strong>10/27 스토어 점검</strong> · Android 지난28일 휴대기기 노출6회, 신규 획득·활성은 데이터 없음. 등록정보 방문자1·설치클릭0은9/26~10/23 집계로 Android 공개 확인10/24 이후를 포함하지 않습니다. 오늘 설치 성과·SNS 귀속으로 쓰지 않습니다. Apple은 세션 만료로 로그인 필요. <a href="marketing-assets/daily-2026-10-27/store-metrics.json">기간·지표·증빙</a></section>'
    html = html.replace('<main class="main">', '<main class="main">' + store_notice, 1)
html = html.replace('국내 소개글 Android 안내 수정안 준비·외부 미적용', '국내 Android 안내: VibeCrew 공개 반영 완료·디스콰이엇 변경안 제출 후 관리자 승인 대기')
html = html.replace('<strong>10/27 실행 완료</strong> · X 답글2건 + Instagram 댓글1건.', '<strong>10/27 실행 완료</strong> · X 답글3건 + Instagram 댓글2건, 오늘 대화5건 완료. 국내 소개글 Android 안내 수정안 준비·외부 미적용 (<a href="marketing-assets/daily-2026-10-27/domestic-copy-update.json">교체 문구</a>).')
notice = '''<section class="notice" id="daily-evidence-2026-10-27"><strong>10/27 실행 완료</strong> · X 답글2건 + Instagram 댓글1건. 새 외부 답변1건은 책 제목·독서 복귀 대화이며 제품 사용·체험 성과는 미확인입니다. 어제 이미지글 중간 수치: X 조회1, Instagram 조회2·조회한 사람1·반응0. 아직24시간 전이며 정시 확인 기준은 오늘23:50~23:52입니다. 10/25 릴스 조회7·반응0 유지. 국내3곳·Reddit 새 피드백 없음. <a href="marketing-assets/daily-2026-10-27/status.json">실행·측정 기록</a> · <a href="marketing-assets/paper-reading-opening-b-2026-10-27/reel.mp4">10/30 후보 릴스B 준비 완료·미게시</a> · <a href="marketing-assets/paper-reading-opening-b-2026-10-27/preview.jpg">미리보기</a>. 첫2.5초만 변경하고 본문·끝 질문·캡션은 유지했습니다. 새 메인 게시물0·유료 집행0원·자동 예약 없음. 11/2 회고 유지.</section>'''
if 'id="daily-evidence-2026-10-27"' not in html:
    marker = '<main class="main">'
    assert html.count(marker) == 1
    board.write_text(html.replace(marker, marker + notice, 1), encoding='utf-8')
else:
    board.write_text(html, encoding='utf-8')
print('Board updated with Oct27 evidence')
