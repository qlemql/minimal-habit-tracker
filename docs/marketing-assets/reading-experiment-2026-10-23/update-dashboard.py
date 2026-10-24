"""Merge verified Oct 23 execution into the dashboard seed and saved-board history."""
from pathlib import Path
import json
import re

ROOT=Path(__file__).resolve().parent
board=ROOT.parents[2]/'docs/marketing-a-z.html'
html=board.read_text(encoding='utf-8')
pattern=r'''(<script\b[^>]*\bid=["']seed["'][^>]*>)(.*?)(</script>)'''
match=re.search(pattern,html,re.S)
assert match, 'Dashboard seed not found'
data=json.loads(match.group(2))
data['snapshot']='2026-10-23'
channels={c['id']:c for c in data['channels']}
channels['instagram']['why']='10/23 비즈니스 계정·앱 페이지 전환 및 인사이트 확인. 독서 실험 첫 릴스 게시, 후속3편 준비. 표시 팔로워1은 본인으로 외부 팔로워0.'
channels['reddit']['stage']='운영 중'
channels['reddit']['why']='u/ssak_habit_tracker 가입·복구 확인. 10/23 r/iOSApps 월간 App Shelf에 규칙에 맞는 ABC 소개·초기 독서 사용자 모집 댓글 게시. 같은 커뮤니티30일 재홍보 금지.'
channels['x']['why']='10/23 초기 독서 사용자3명 모집글과 실제9초 데모·스토어 링크 답글 게시. 외부 팔로워0, 실제 참가자 아직 미확보.'

tasks={
 'instagram':[
  {'id':'instagram-oct23-business','text':'10/23 비즈니스 계정·앱 페이지 전환 완료','state':'done'},
  {'id':'instagram-oct23-reel','text':'10/23 독서 실험 첫9초 릴스 게시','state':'done'},
  {'id':'instagram-oct23-kit','text':'독서 릴스4편 제작·검수 완료 · 1편 게시/3편 준비','state':'done'},
  {'id':'instagram-oct23-trial','text':'모바일에서 Trial Reels 옵션 확인 · 웹에서는 미노출','state':'unknown'}],
 'x':[
  {'id':'x-oct23-recruit','text':'10/23 iPhone 독서 사용자3명 모집글 게시','state':'done'},
  {'id':'x-oct23-demo','text':'모집글에 실제 데모·공개 App Store 링크 답글 게시','state':'done'}],
 'reddit':[
  {'id':'reddit-oct23-account','text':'u/ssak_habit_tracker 가입·정상 프로필 복구','state':'done'},
  {'id':'reddit-oct23-shelf','text':'10/23 r/iOSApps 월간 App Shelf ABC 소개·모집 댓글 게시','state':'done'},
  {'id':'reddit-oct23-followup','text':'기존 모집 댓글의 필터 상태·실제 사용자 답변 확인 · 30일 내 재홍보 금지','state':'todo'}]
}
for channel,items in tasks.items():
    existing={t['id']:t for t in channels[channel]['setup']}
    for task in items:
        if task['id'] in existing: existing[task['id']].update(task)
        else: channels[channel]['setup'].append(task)
for task in channels['instagram']['setup']:
    if task['id']=='instagram-6': task['state']='done'
for task in channels['reddit']['setup']:
    if task['id'] in ['reddit-0','reddit-4']: task['state']='done'

links={
 'instagram':[['10/23 첫 독서 실험 릴스','https://www.instagram.com/reel/De1kY_Ntqis/']],
 'x':[['10/23 초기 독서 사용자 모집','https://x.com/Ssakhabit/status/2113609637534871863'],['10/23 실제 독서 데모 답글','https://x.com/Ssakhabit/status/2113610428215656837']],
 'reddit':[['싹 Reddit 프로필','https://www.reddit.com/user/ssak_habit_tracker/'],['10/23 App Shelf 소개·모집','https://www.reddit.com/r/iosapps/comments/1wvvq6p/comment/19rj80bj0lgw4/']]
}
for channel,items in links.items():
    channel_links=channels[channel].setdefault('links',[])
    for link in items:
        if not any(x[1]==link[1] for x in channel_links): channel_links.append(link)

html=html[:match.start(2)]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+html[match.end(2):]
logs=[
 {'id':'oct23-business-insights','date':'2026-10-23','channel':'instagram','text':'비즈니스 계정·앱 페이지 전환 및 인사이트 접근 확인. 공개 연락처 추가 없음. 계정 전환 자체를 도달 증가 효과로 집계하지 않음.'},
 {'id':'oct23-ig-reel','date':'2026-10-23','channel':'instagram','text':'독서 실험 첫9초 릴스 게시. 실제 웹 데모·예시 데이터·9:16·무음 자막. 웹 Trial 토글 미노출로 일반 릴스. https://www.instagram.com/reel/De1kY_Ntqis/'},
 {'id':'oct23-x-recruit','date':'2026-10-23','channel':'x','text':'iPhone 독서 사용자3명 모집 시작. 실제 참가자는 아직 미확보. https://x.com/Ssakhabit/status/2113609637534871863 · 실제 데모/스토어 링크 답글 https://x.com/Ssakhabit/status/2113610428215656837'},
 {'id':'oct23-reddit-recruit','date':'2026-10-23','channel':'reddit','text':'u/ssak_habit_tracker 가입·응답 없는 탭 복구. r/iOSApps 월간 App Shelf ABC 소개/모집 게시, 본문·직접 링크·봇 답글 확인. 비로그인 공개 검증은 미완료. 동일 커뮤니티30일 내 재홍보 금지. https://www.reddit.com/r/iosapps/comments/1wvvq6p/comment/19rj80bj0lgw4/'},
 {'id':'oct23-reel-kit','date':'2026-10-23','channel':'instagram','text':'릴스4편 제작·검수: 1편 게시, 3편 준비. 후속 후보일10/27·10/30·11/3. 자동 예약 없음. 초기3명 모집·동의 후 일주일 질문3개 준비. 형식 탐색이며 무작위 A/B 테스트가 아님.'},
 {'id':'oct23-external-baseline','date':'2026-10-23','channel':'instagram','text':'Instagram 표시 팔로워1은 운영자 본인. Instagram·X 외부 팔로워0. 본인 답글·기본 점수·봇 답글을 외부 사용자 반응으로 집계하지 않음.'},
 {'id':'oct23-next-action','date':'2026-10-23','channel':'instagram','text':'다음 제안: 프로필 소개에 바쁜 날 대안·iOS·습관1개 무료를 명확히 하기. Instagram 모바일 Trial Reels 옵션 확인. 모집 응답·게시 후24시간 지표는 실제 경과 후 수집. 추가 대량 게시보다 기존 모집 대화와 전환 경로 점검 우선. 프로필 수정은 아직 미실행.'}
]
metric={'id':'oct23-ig-baseline','date':'2026-10-23','channel':'instagram','lang':'EN','asset':'계정 인사이트 최근30일 · 10/23 비즈니스 전환 직후 기준','reach':177,'clicks':None,'visits':None,'installs':None,'minutes':None,'note':'조회222·비팔로워 조회89.2%·반응2·참여 계정2·프로필 방문1. 표시 팔로워1=본인, 외부0. 특정 게시물/당일 성과가 아니며 본인·점검 활동 포함 가능. 프로필 방문1은 링크 클릭으로 집계하지 않음. 설치·모집 참가자는 추정하지 않음.'}
task_changes=[['instagram','instagram-6','done'],['reddit','reddit-0','done'],['reddit','reddit-4','done']]
task_changes += [[channel,t['id'],t['state']] for channel,items in tasks.items() for t in items]
helper='''// Oct 23 verified execution: merge without replacing personal notes or prior records.
const OCT23_EXECUTION_LOGS=LOG_VALUES;
const OCT23_BASELINE=METRIC_VALUE;
function applyOct23Execution(next){
  const already=next.logs.some(x=>x.id==='oct23-business-insights');
  let changed=false;
  for(const log of OCT23_EXECUTION_LOGS)if(!next.logs.some(x=>x.id===log.id)){next.logs.push({...log});changed=true}
  if(!next.metrics.some(x=>x.id===OCT23_BASELINE.id)){next.metrics.push({...OCT23_BASELINE});changed=true}
  if(!already){
    for(const [channel,id,value] of TASK_VALUES)next.channels[channel].tasks[id]=value;
    next.channels.reddit.active=true;next.channels.reddit.stage='운영 중';
    next.daily['2026-10-23']={...(next.daily['2026-10-23']||{}),'global-daily-note':true};
  }
  return changed;
}
'''.replace('LOG_VALUES',json.dumps(logs,ensure_ascii=False)).replace('METRIC_VALUE',json.dumps(metric,ensure_ascii=False)).replace('TASK_VALUES',json.dumps(task_changes,ensure_ascii=False))
if 'function applyOct23Execution(' not in html:
    html=html.replace('const initial=()=>',helper+'const initial=()=>',1)
    html=html.replace('function save(){','if(applyOct23Execution(state))save();\nfunction save(){',1)
board.write_text(html,encoding='utf-8')
print('Dashboard updated: Oct 23 snapshot, 7 logs, baseline metric, verified tasks and channel links; existing browser records merge on opening.')
