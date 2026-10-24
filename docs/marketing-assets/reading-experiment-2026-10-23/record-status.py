"""Record verified publication evidence without changing application code."""
from pathlib import Path
import json
import zipfile

ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[2]
reddit_url='https://www.reddit.com/r/iosapps/comments/1wvvq6p/comment/19rj80bj0lgw4/'
x_demo_url='https://x.com/Ssakhabit/status/2113610428215656837'

checks=json.loads((ROOT/'community-checks.json').read_text(encoding='utf-8'))
checks['reddit_account_status']='ssak_habit_tracker confirmed; fresh own-profile tab works; unresponsive signup tab closed. Google-linked account; no verify-email prompt visible in account settings.'
checks['published_on_reddit']=True
checks['comment_url']=reddit_url
checks['verification']='Comment posted toast; permalink reopened; full ABC text and automated app-store-review reply visible; no removal notice on own comment. Anonymous web fetch unavailable, so separate logged-out visibility was not verified.'
checks['candidates'][0]['status']='Posted once in the explicitly allowed monthly App Shelf. Do not promote again in this community within 30 days, including if later removed.'
(ROOT/'community-checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')

m=json.loads((ROOT/'measurement.json').read_text(encoding='utf-8'))
if not any(p['id']=='app-shelf-recruitment' for p in m['post_measurements']):
    m['post_measurements'].append({'id':'app-shelf-recruitment','channel':'reddit','url':reddit_url,'status':'posted; no human participant confirmed','external_reactions':None})
m['confirmed_participants']=[]
m['posts_notes']='X self-reply and Reddit app-store-review bot reply are not recruited users or independent human feedback.'
(ROOT/'measurement.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')

manifest=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))
manifest['posts'][0]['x_url']=x_demo_url
manifest['posts'][0]['status']='PUBLISHED'
manifest['status']='VISUALLY_REVIEWED; ONE_PUBLISHED_THREE_READY'
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')

status='''2026-10-23 KST · verified execution

Instagram: Business / 앱 페이지 전환 완료. 공개 연락처 추가 없음.
첫 릴스: https://www.instagram.com/reel/De1kY_Ntqis/
표준 릴스 게시. 웹 작성기에 Trial Reels 토글이 노출되지 않았음. 모바일 가능 여부는 미확인.
나머지 3편: 준비 완료 / 미게시 / 자동 예약 없음. 10/27·10/30·11/3은 계획 후보일.

X 초기 독서 사용자 3명 모집: https://x.com/Ssakhabit/status/2113609637534871863
X 실제 데모와 스토어 링크 답글: https://x.com/Ssakhabit/status/2113610428215656837

Reddit: 사용자가 u/ssak_habit_tracker 가입 완료. 기존 응답 없는 탭을 닫고 새 탭의 정상 프로필·로그인 상태 확인.
월간 App Shelf ABC 소개/모집: https://www.reddit.com/r/iosapps/comments/1wvvq6p/comment/19rj80bj0lgw4/
댓글 게시됨 안내·직접 링크·본문·자동 앱 정보 답글 확인. 별도 비로그인 접근은 웹 도구에서 읽지 못했음. 게시 후 필터 상태는 이후 반응 점검 때 확인.
동일 커뮤니티 30일 홍보 제한 적용. 재게시하지 않음.

인사이트 기준: 최근 30일 조회222·도달 계정177·비팔로워 조회89.2%·반응2·프로필 방문1.
Instagram 표시 팔로워1은 사용자 본인. Instagram·X 외부 팔로워0.
실제 모집 참가자0명 확인 상태. 본인 답글·봇 답글은 참가자/실제 피드백에 포함하지 않음.
24시간·7일 측정은 실제 경과 후 수집. 자동 알림·DM·광고 집행 없음.
'''
(ROOT/'publishing-status.txt').write_text(status,encoding='utf-8')

plan=REPO/'docs/marketing-plan.ko.md'
s=plan.read_text(encoding='utf-8')
heading='## 2026-10-23 · Reddit 싹 계정 복구와 해외 사용자 모집 댓글 완료'
if heading not in s:
    marker='## 2026-10-23 · 프로페셔널 전환·독서 릴스 1편·X 초기 사용자 모집 실행'
    note=f'''{heading}

사용자가 `u/ssak_habit_tracker`로 가입했다. 기존 Reddit 탭은 화면 트리 요청에도 응답하지 않았으나 새 탭에서 본인 프로필·로그인·0일 계정을 확인해 가입 완료를 검증했다. 응답 없는 기존 탭을 닫고 정상 프로필 탭을 남겼다. 계정 설정에는 Google 연결과 이메일이 표시됐고 별도 이메일 인증 요청 문구는 보이지 않았다. 이메일 주소·인증 정보는 마케팅 파일에 저장하지 않았다.

[r/iOSApps 10월 App Shelf 댓글]({reddit_url})로 싹 소개와 초기 독서 사용자 모집을 게시했다. 새 계정과 사용자 이름을 확인하고, 해당 스레드가 카르마10 미만 계정에도 허용하는 ABC 형식으로 작성했다. Apple Reminders 체크리스트를 대안으로 이름을 밝히고 싹의 두 목표·주간 기록을 한 습관에서 보는 장점을 설명했다. 무료 습관1개·미국 Plus 일회성$2.99·지역별 가격 차이·자동 동기화 미제공·공개 스토어 링크를 명시했다. $2.99는 오늘 공개 미국 App Store 인앱 구매 항목에서 확인했다.

`댓글 게시됨` 안내 후 직접 링크를 다시 열어 본문과 `app-store-review` 자동 답글을 확인했다. 본인 댓글에는 삭제 알림이 보이지 않았다. 별도 비로그인 웹 조회는 읽기 실패이므로 익명 접근 검증 완료로 기록하지 않는다. 봇 답글과 기본 점수1은 실제 사용자 참여로 집계하지 않는다. **모집 시작, 실제 참가자 아직0명**이다. 이 커뮤니티에서는 제거 여부와 무관하게30일 내 재홍보하지 않는다. 증빙: [Reddit 모집 댓글](marketing-assets/reading-experiment-2026-10-23/reddit-app-shelf-published.png), [정상 계정 복구](marketing-assets/reading-experiment-2026-10-23/reddit-account-recovered.png), [통합 실행 상태](marketing-assets/reading-experiment-2026-10-23/publishing-status.txt).

'''
    s=s.replace(marker,note+marker,1)
s=s.replace('Instagram: 게시물10·팔로워1·팔로잉0.','Instagram: 게시물10·표시 팔로워1(사용자 본인, 외부 팔로워0)·팔로잉0.')
plan.write_text(s,encoding='utf-8')

policy=REPO/'docs/marketing-policy.ko.md'
s=policy.read_text(encoding='utf-8')
new='2026-10-23 추가 실행: 사용자 승인으로 독서 타깃의 2주 릴스4편 실험과 초기 사용자3명 모집을 시작했다. 릴스1편과 X 모집글·데모 답글, Reddit의 허용된 월간 App Shelf 소개를 게시했다. 릴스3편은 준비 완료·미게시이며 예약하지 않았다. 같은 타깃의 서로 다른 형식 탐색으로, 반응을 보고 다음 편을 수정한다. 외부 팔로워는 두 채널 모두0으로 기록한다. Instagram 표시1명은 사용자 본인이다. 정확한 게시·측정 상태는 운영 계획 최신 기록을 따른다.'
if new not in s:
    s=s.replace('2026-10-22 실행: POV와',new+'\n\n2026-10-22 실행: POV와',1)
policy.write_text(s,encoding='utf-8')

board=REPO/'docs/marketing-a-z.html'
s=board.read_text(encoding='utf-8')
anchor=s.index('<div class="eyebrow">NEXT BEST STEP</div>')
start=s.index('<h2',anchor)
end=s.index('<h3>',start)
replacement='''<h2 style="margin-top:12px">10/23 독서 실험과 사용자 모집을 시작했어요.</h2><p>Instagram을 무료 비즈니스 계정·앱 페이지로 전환하고 첫 독서 릴스를 게시했습니다. X 모집글과 실제 데모 답글, Reddit 월간 App Shelf 소개도 게시했습니다. 외부 팔로워는 두 SNS 모두 0명이며 표시된 Instagram 1명은 운영자 본인입니다. 실제 참가자는 아직 확인되지 않았습니다.</p><div class="plain-links"><a href="https://www.instagram.com/reel/De1kY_Ntqis/" target="_blank" rel="noopener">첫 독서 릴스 ↗</a><a href="https://x.com/Ssakhabit/status/2113609637534871863" target="_blank" rel="noopener">X 사용자 모집 ↗</a><a href="https://www.reddit.com/r/iosapps/comments/1wvvq6p/comment/19rj80bj0lgw4/" target="_blank" rel="noopener">Reddit App Shelf ↗</a><a href="marketing-assets/reading-experiment-2026-10-23/publishing-status.txt">오늘 실행 기록 ↗</a><a href="marketing-assets/reading-experiment-2026-10-23/contact-sheet.jpg">릴스 4편 미리보기 ↗</a></div><p>나머지 릴스 3편은 준비 완료·미게시이며 10/27·10/30·11/3은 계획 후보일입니다. 웹에서는 Trial 토글이 보이지 않아 첫 편은 일반 릴스로 게시했습니다. 실제 경과 후 24시간·7일 지표를 확인합니다. 자동 예약·알림·유료 집행은 설정하지 않았습니다.</p>'''
s=s[:start]+replacement+s[end:]
s=s.replace('후속 비교 데모는 미제작입니다.','10/23 독서 릴스4편을 준비했고 1편을 게시했습니다. 나머지3편은 반응을 보고 수정합니다.')
board.write_text(s,encoding='utf-8')

with zipfile.ZipFile(ROOT/'reading-experiment-kit.zip','w',zipfile.ZIP_DEFLATED) as z:
    for post in manifest['posts']:
        for name in ['reel.mp4','instagram-caption.txt','description.txt']:
            p=ROOT/post['id']/name
            z.write(p,p.relative_to(ROOT))
    for name in ['contact-sheet.jpg','manifest.json','measurement.json','recruitment-x.txt','recruitment-reddit-draft.txt','reddit-app-shelf-draft.txt','tester-protocol.txt','verification.json','community-checks.json','publishing-status.txt']:
        z.write(ROOT/name,name)
with zipfile.ZipFile(ROOT/'reading-experiment-kit.zip') as z:
    assert z.testzip() is None
print('Recorded Instagram, X and Reddit publications; updated plan, policy, board and ZIP.')
