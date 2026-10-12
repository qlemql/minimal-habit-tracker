# 리뉴얼 후속 개발 — 2026-10-06

## 2026-10-12 한 습관을 기본으로 한 위젯 구성

사용자 피드백: 무료는 활성 습관 1개이므로 3행 중 한 행만 남기는 디자인은 어색하다. 기본을 1개 전용 카드로, Plus의 2~3개는 개수에 맞는 목록으로 확장한다.
1. 기존 `canTrackHabit` 필터와 무료/Plus 권한을 유지하고 전달받은 활성 습관 개수로 구성만 선택한다. Plus라도 한 습관이면 동일한 기본 카드를 쓴다.
2. iOS/Android 중형 1개는 이름·최소 행동·주간 실천을 담은 가로 카드, 2개는 여유 있는 두 행, 3개는 간격을 유지한 세 행으로 구성한다. 소형도 1개 카드에서 2~3개 요약 목록으로 전환한다.
3. 잠금 화면 직사각형은 1개일 때 습관 이름·상태·주간 실천, 여러 개는 이름이 있는 행으로 확장한다. 원형/인라인의 진행률 요약은 유지한다. 기본 갤러리 미리보기를 1개로 바꾼다.
4. 빈 상태·1/2/3개·긴 이름·최소 행동·완료/작은 완료 및 네 언어·확대 글자 렌더를 검토하고 네이티브 빌드/링크 확인 후 실기기에 갱신한다.

### 개수별 구성 반영 및 검증 완료

- iOS/Android 중형은 1개 카드, 2개 상세 행, 3개 간격 있는 목록으로 전환한다. 소형은 1개 카드와 2~3개 요약 목록을 구분한다. 잠금 화면 직사각형도 한 습관의 이름·상태·주간 횟수를 기본으로 보여준다. 원형/인라인은 기존 진행률 요약을 유지한다.
- 기본 iOS 갤러리 샘플과 Android previewLayout을 한 습관으로 변경했다. Android 새 레이아웃들은 Expo 플러그인의 복사 대상에 포함했다. 권한은 기존 `canTrackHabit` 필터를 그대로 사용한다.
- 실제 소스를 SwiftUI/RemoteViews로 렌더해 iOS 5종·Android 2종 × 8상태 × 4언어 × 기본/확대 조건 = 448개를 생성했다. 한 개 미완료·완료·작은 완료·긴 이름/최소 행동, 두 개, 세 개, 긴 이름 세 개, 빈 상태를 포함한다. 대표 연락판과 긴 이름을 검토했으며 겹침 없이 말줄임 처리된다. iOS 고정 pt 텍스트는 Dynamic Type XXXL에서도 크기가 유지된다.
- `npm run typecheck`, Vitest 54개, Swift/Kotlin 날짜 모델 10개 사례 및 레거시/작은 완료/링크 검사(서울·UTC·뉴욕), `git diff --check` 통과. iOS Simulator/실기기 Release 및 Android Debug 빌드 성공.
- iPhone 13 mini / iOS 26.4 시뮬레이터 XCTest로 기존 한 습관의 소형·중형 탭 → 해당 기록 화면 연결을 확인했다. 홈 화면과 기본 1개 갤러리 소형·중형 캡처를 저장했다. 잠금 화면은 독립 뷰 렌더, Android는 RemoteViews 렌더 검증이며 실제 시스템 배치 검증과 구분한다.
- 비교 자료: `artifacts/widget-count-layouts-2026-10-12/index.html` (이전 감사 자료와 별도 보존).
- 2026-10-12 17:25 KST 연결된 iPhone에 새 앱/위젯을 EAS 저장 Ad Hoc 서명으로 덮어 설치했고 17:26 실행 성공. 버전 2.0.0(13). 기존 앱을 삭제하거나 데이터를 초기화하지 않았다. 실기기 위젯 화면·조작 최종 확인은 사용자가 진행한다. 임시 키체인과 다운로드한 인증서/프로파일은 삭제했다.

## 2026-10-12 실기기 위젯 설치

사용자 요청: 최신 리뉴얼+위젯을 연결된 iPhone에 설치하고 사용자가 동작 확인한다.
1. 기기·설치 앱·서명 인증서와 App Groups 프로파일을 확인한다.
2. 앱/위젯의 동일 App Group을 유지한 채 Xcode 자동 서명으로 실기기 Release 빌드를 시도한다.
3. 유효하게 서명된 위젯 포함 빌드만 기존 앱 위에 설치하고 버전·확장 포함 여부를 확인한다. 앱 삭제나 데이터 초기화는 하지 않는다.

### EAS 저장 서명을 통한 대체 설치

Xcode 로그인 없는 설치를 위해 기존 EAS `preview-device` 서명을 확인한다. 앱/위젯 Ad Hoc 프로파일 모두 현재 iPhone이 등록돼 있고 인증서는 2027-04-13까지다. EAS 공식 credentials 다운로드를 사용해 임시 보호 디렉터리에 서명을 받고, 프로파일의 App Group·기기·만료를 확인한 뒤 컴파일된 최신 앱을 서명한다. 설치 후 임시 키체인과 다운로드한 비밀 파일을 정리한다.

### EAS 서명 대체 설치 완료

- EAS에 저장된 Ad Hoc 서명을 공식 `eas credentials` 다운로드로 받아 확인했다. 앱과 HabitWidget 프로파일 모두 App Group `group.com.qlemql.minimalhabittracker`, 기기 UDID, 2027-04-13 만료 조건을 만족했다.
- 이미 컴파일한 `feat/ssak-renewal` 최신 Release 앱의 별도 사본에 Distribution 서명을 적용했다. 프레임워크 → HabitWidget → 앱 순서로 서명하고 `codesign --verify --deep --strict`를 통과했다. 앱/확장 그룹 entitlement도 다시 확인했다.
- 임시 키체인에서만 서명했다. 처음에는 인증서 체인을 찾지 못해 실패했으며 임시 검색 목록에 키체인을 포함한 후 성공했다. 완료 후 원래 키체인 검색 목록을 복원하고 임시 키체인과 다운로드한 개인 키·비밀번호 파일을 제거했다. 프로젝트에 자격 증명 파일을 남기지 않았다.
- 2026-10-12 17:06~17:07 KST, 연결된 iPhone 13 mini에 **위젯 포함 2.0.0 (13)** 설치 성공. `devicectl`에서 새 설치 경로를 확인했고 앱 실행도 성공했다. 기존 앱을 삭제하지 않고 덮어 설치했다.
- Xcode 계정 로그인과 신규 EAS 클라우드 빌드 없이 설치했다. 물리 기기의 위젯 추가·탭·기록 갱신은 사용자가 이어서 확인한다.
- 서명된 앱 경로는 `/tmp/ssak-device-signed-app-path.txt`에 기록했다. 설치/실행 영수증은 `/tmp/ssak-device-widget-install-result.json`, `/tmp/ssak-device-widget-launch.json`이다. 이전 로그인 대기 기록은 아래의 경과 기록이며 현재 설치 차단 상태가 아니다.

### 실기기 설치 진행 상태

- 연결된 iPhone 13 mini(iOS 26.6.1)는 개발자 모드 활성화 상태이며, 현재 앱은 2.0.0 (13)이다.
- 실기기 Release 빌드를 `-allowProvisioningUpdates -allowProvisioningDeviceRegistration`으로 시도했다. Xcode가 앱/위젯 모두 `No Accounts: Add a new account in Accounts settings`를 반환했다.
- 로컬 와일드카드 개발 프로파일에는 App Groups가 없고 앱의 Push Notifications 권한도 없어 위젯 포함 서명에 사용할 수 없다. 인증서는 존재하지만 유효한 프로파일 발급에 개발자 계정 로그인이 필요하다.
- 올바른 리뉴얼 Xcode 워크스페이스를 열고 사용자에게 Xcode 내 개발자 계정 로그인을 요청했다. 채팅으로 자격 증명을 받지 않는다.
- 서명 없이 실기기 Release 컴파일 성공. 앱과 HabitWidget 확장 모두 2.0.0 (13), 번들 JS 포함을 확인했다.
- 사용자 재개 요청 후 자동 서명을 다시 시도했으나 앱/위젯 모두 동일한 No Accounts 및 App Groups 프로파일 오류로 중단됐다. Xcode 계정 로그인 대기 중이며 설치는 미완료다. 유효한 서명 후 기존 앱 위에 설치한다. 현재 실기기 앱/데이터 변경 없음.

## 2026-10-12 위젯 브랜드 표시 정리

사용자 승인: 새 S 앱 아이콘을 유지하고, 위젯의 이전 잎 로고와 반복 브랜드명을 덜어낸다. 일본어·번체 중국어는 현재의 현지화된 습관/진행 문구를 사용한다.
1. 원형은 진행률과 숫자만 표시하고 접근성 의미를 유지한다.
2. 인라인의 장식 아이콘과 싹/Ssak 접두어를 제거하고 네 언어의 빈 상태·진행·완료 문구를 정리한다.
3. 네 언어·각 상태를 네이티브 렌더로 재확인하고 iOS 빌드 및 최신 비교 화면에 반영한다.

한국어 인라인 추가 조정: 빈 상태 `습관 추가`, 진행 `오늘 2/3`, 완료 `1/1 완료`로 단축했다. 기본/XXXL 네이티브 렌더를 비교했고, 비교 페이지는 기본 글자로 열리며 확대 조건을 직접 전환할 수 있다. iOS Release 빌드·문자열 문법·diff 검사 통과 후 전용 시뮬레이터에 설치했다.

### 브랜드 표시 정리 결과

- 원형을 아이콘 없는 진행률 링과 숫자로 변경했다. 습관 의미와 횟수의 접근성 라벨은 유지한다.
- 인라인의 잎/완료 장식 아이콘과 싹/Ssak 접두어를 제거했다. 빈 상태는 습관 추가 안내, 나머지는 각 언어의 오늘·진행 횟수·완료로 표시한다.
- 홈 위젯의 현지화된 제목과 새 S 앱 아이콘을 유지했다. 한자 브랜드명으로의 개명은 이번 변경에 포함하지 않는다.
- 네 언어 × 빈 상태·1/2/3개·긴 이름 × 기본/XXXL의 SwiftUI 렌더를 갱신했다. 변경된 원형·인라인의 빈 상태/진행/완료를 확대 조건에서 시각 확인했다. iOS Release 빌드, 네 로케일 plist 문법, diff 검사 통과. 변경된 빌드를 기존 전용 시뮬레이터에 설치했다.
- 최신 비교: `artifacts/widget-spacing-audit-2026-10-12/brand-cleanup.html`. 잠금 화면은 독립 네이티브 뷰 렌더이며 실제 시스템 배치는 별도다.

## 2026-10-12 위젯 여백 전수 점검

사용자 피드백: 중형 3행이 붙어 보여 모든 위젯을 점검한다.
1. iOS 소형/중형/원형·직사각·인라인 잠금 화면, Android 소형/중형 총 7종을 목록화한다.
2. 실제 소스의 네이티브 렌더로 빈 상태, 1/2/3개, 일반·작은 완료, 긴 이름·최소 행동, 네 언어와 확대 글자 상태를 대조한다.
3. 중형의 반복 문구·구분선을 줄여 행 사이 여백을 확보하고, 소형의 이름 줄 수와 Android 크기 전환 경계를 점검한다.
4. 수정 후 네이티브 렌더 및 실제 iOS 위젯 갤러리를 다시 확인하고 빌드·날짜 모델 검사를 수행한다. 네이티브 뷰 검사와 OS 홈/잠금 화면 배치 확인을 구분한다.

### 여백 점검 결과

| 종류 | 발견한 문제 / 조치 |
|---|---|
| iOS 중형 | 3행의 두 줄 텍스트·구분선 밀집. 한 줄 행, 공통 주간 헤더, 10pt 행 간격으로 정리. |
| iOS 소형 | 심한 겹침은 없지만 본문과 하단 안내의 간격을 명시하고 이름은 한 줄로 유지. |
| iOS 잠금 화면 원형 | 확대 조건에서 영어 Habits가 원 양끝에 닿음. 잎 아이콘으로 정리하고 접근성 라벨은 유지. |
| iOS 잠금 화면 직사각형 | 체크 간격 5→9pt, 크기 14→17pt. 시스템 전경색을 따르도록 홈 위젯 색상 범위 분리. |
| iOS 잠금 화면 인라인 | 한 줄 요약에서 항목 간 밀집·겹침 없음. 구성 유지. |
| Android 중형 | 최소 크기에서 3행이 밀집하고 글자 130%에서 주간 문구 잘림. 한 줄 구성, 44dp 행과 8dp 간격, 최소 280×216dp. |
| Android 소형 | 긴 이름 두 줄이 주간 횟수를 밀어내고 확대 글자에서 잘림. 한 줄 말줄임과 본문 간격, 최소 160×208dp. |

- 네이티브 뷰 비교: iOS 5종 × 5상태 × 4언어 × 2글자 조건 × 수정 전후 = 400장, Android 2종의 같은 조합 = 160장. 빈 상태, 1/2/3개, 긴 이름·최소 행동, 일반/작은 완료가 포함된다. Android의 짧은 습관명은 고정 영어 테스트 데이터, 긴 이름과 시스템 문구는 각 언어다.
- iOS는 Dynamic Type XXXL 환경(고정 pt 본문은 크기 유지), Android는 130% 글자 크기다. 모든 접근성 크기 또는 모든 기기 검증을 의미하지 않는다.
- 독립 SwiftUI/RemoteViews 렌더와 실제 OS 화면을 구분했다. 실제 iPhone 13 mini 시뮬레이터의 소형·중형 홈 화면과 3행 시스템 갤러리를 추가 촬영했다. 잠금 화면 시스템 배치와 Android 런처 배치는 미검증이다.
- iOS Release 및 Android Debug 전체 빌드 성공. TypeScript, Vitest 54개, Swift/Kotlin 날짜 모델 각 10사례 × 서울/UTC/뉴욕 통과.
- 최종 XCTest에서 수정된 중형·소형 탭 → 동일 습관 기록 화면 및 기존 작은 실천 유지 확인. 초기 보조 확인은 이미 완료된 행동을 버튼으로 찾은 테스트 선택자 오류였으며, 실제 텍스트 요소로 수정 후 통과했다. 임시 렌더 앱과 테스트 러너는 제거했다.
- 비교 자료: `artifacts/widget-spacing-audit-2026-10-12/index.html`. 이전 실행 갤러리에는 수정 전 기록임을 표시하고 최신 비교 링크를 추가했다.
- 사용자 실기기 데이터 변경, 커밋·푸시 없음.

## 2026-10-12 실제 리뉴얼 + 위젯 실행 확인

사용자 요청: `feat/ssak-renewal`을 기준으로 위젯이 적용된 실제 앱을 보고 싶다.
main에서 잘못 진행한 앱 UI 재작업은 옮기지 않는다.

작업 순서:
1. 10월 8일 위젯 시안의 소형 한 습관/중형 목록 표시를 리뉴얼 위젯에 적용한다.
2. 리뉴얼의 `effort: tiny/full`, 주간 목표, 무료/Plus 권한, `/practice?id=` 기록 화면과 네 언어를 유지한다. 기존 작은 위젯의 3행 목록을 한 습관 카드로 교체한다.
3. 타입·기존 도메인·네이티브 날짜 모델 검사와 네이티브 빌드를 확인한다.
4. 별도 iPhone 13 mini 시뮬레이터에서 앱과 홈 위젯을 실행하고, 위젯 탭·기록·갱신을 실제 확인한다. 실기기 설치는 App Groups 서명 가능 여부부터 확인한다.

진행 세션/Live Activity는 리뉴얼의 기존 후속 문서에 따라 홈 위젯 다음 범위로 유지한다. 이번 화면 확인을 위해 리뉴얼 앱 구조나 데이터 모델을 main의 것으로 교체하지 않는다.

### 실행 확인 결과

- iOS 소형 위젯을 한 습관 카드로 교체하고 최소 행동을 표시한다. 중형은 최대 3개 목록·주간 목표·완료/작게 완료 상태를 표시한다. 소형과 중형 모두 해당 `/practice?id=`로 연결한다.
- Android도 같은 표시를 사용하고 크기에 따라 한 습관/목록으로 전환한다. 리뉴얼의 네 언어, 권한 필터, 과거 대기 이벤트 처리와 날짜 모델을 유지했다.
- 앱 변경은 공유 payload에 선택적 `minimum`을 추가한 것뿐이다. 리뉴얼 화면, 내비게이션, `effort: tiny/full` 저장 모델은 변경하지 않았다.
- TypeScript, Vitest 54개, Swift/Kotlin 날짜 모델 각 10사례·구형 payload·딥링크·작은 실천 상태(서울/UTC/뉴욕), `git diff --check` 통과.
- iOS Release Simulator(위젯 포함, arm64) 빌드 성공. Android Debug APK 전체 빌드 성공.
- 별도 `Ssak Renewal Widgets` iPhone 13 mini / iOS 26.4 시뮬레이터에 2.0.0 (13)을 설치했다. 앱 내부 JS 번들을 사용하는 Release 빌드로 다른 폴더의 Metro와 혼동하지 않는다.
- 앱의 명시적 ‘예시 보기’로 데이터를 만들었다. XCTest로 소형·중형 위젯을 홈에 추가했고, 중형 탭 → 해당 습관 → ‘책 한 페이지 읽기’ 기록 → 두 위젯의 1/5·작게 완료 갱신을 확인했다. 소형 탭으로 같은 기록 화면이 열리는 것도 확인했다.
- 실제 실행 캡처: `artifacts/widget-implementation-2026-10-12/index.html`. 갤러리의 3개 습관은 WidgetKit 샘플이며 무료 한도를 우회하지 않았다. 사용자 실기기 데이터는 사용하지 않았다.
- 연결된 iPhone의 앱은 변경하지 않았다. 현재 로컬 프로파일에는 App Groups 권한이 없어 위젯 포함 실기기 설치는 미완료다. Android 실제 화면, 잠금 화면 위젯 배치, Live Activity는 이번 시각 검증 범위 밖이다.
- 커밋·푸시·배포 없음. 초기 자동화 두 번은 화면 밖 버튼/아이콘 선택으로 실패했으며, 스크롤·현재 페이지를 맞춘 후 주요 흐름의 최종 실행이 통과했다.

기준: `feat/ssak-renewal`, `dc0cbe7`. 사용자 요청 범위는 개발 환경/회귀검증,
iOS 빌드·실행 확인, 위젯과 새 제품 방향의 정합성까지다.

## 작업 순서

1. lockfile로 의존성 설치, TypeScript·Vitest·프로덕션 웹·전체 E2E 재검증.
2. 독립된 iOS 테스트 환경에서 네이티브 빌드와 실행 확인. 기존 설치 데이터는 건드리지 않는다.
3. 위젯을 Soft Fold 색상과 월요일 시작 주간 목표에 맞춘다.
   - 일반/최소 행동 모두 하루 한 번으로 계산한다. 쉬는 날을 실패나 연속 기록 초기화로 표시하지 않는다.
   - 주간 목표는 각 습관의 설정값, 구버전 미설정 값은 앱과 같은 7일이다.
   - 위젯에서 습관을 열어 앱의 동일한 일반/최소 행동 선택과 취소를 사용한다.
     Android의 기존 즉시 토글 대신 명시적인 선택 화면으로 연결한다.
     구버전 위젯에서 이미 발생한 대기 입력의 저장·중복 방지·확인은 유지한다.
   - 작은 iOS 위젯/잠금 화면은 오늘 화면으로, 중간 크기와 Android는 해당 습관으로 연결한다.
4. 변경한 계산·딥링크·권한 경계를 회귀검증하고 최종 빌드 결과와 미검증 범위를 기록한다.

## 범위 밖

실제 스토어 결제·환불, 정책 게시, 출시 및 커밋/푸시는 이번 요청 범위에 포함하지 않는다.
기존 main 작업 폴더는 그대로 보존한다.

## 검증 결과

### 완료한 구현

- iOS·Android 위젯의 흐름 일수를 `이번 주 실천 횟수 / 설정한 주간 목표`로 교체.
  월요일 시작, 중복·미래 날짜 제외, 최소 행동도 하루 한 번. 목표를 넘긴 실천도 그대로 표시.
- Soft Fold 배경·본문·강조색과 절제된 완료 문구 적용. 최소 행동을 한 날은 별도 표시.
- Android 행과 iOS 중간 크기 위젯 행은 해당 습관 상세로 이동.
  상세 상단의 공통 HabitAction으로 일반/최소 실천을 선택하고 취소할 수 있다.
  졸업한 습관과 무료 한도 밖 습관에는 기록 버튼이 없다.
- iOS 작은 위젯과 잠금 화면은 오늘 화면으로 이동. 빈 위젯에서 앱을 열 수 있다.
- Android의 신규 위젯 탭은 기록을 자동 변경하지 않는다. 기존 날짜 포함 큐는 종전의
  저장 후 확인·중복 방지 경로로 가져온다. 과거 전체 실천 이벤트를 가져올 때 최소 실천 표시는 제거한다.
- iOS는 7일간 자정 timeline 항목을 미리 제공하고 마지막 항목에서 다시 갱신을 요청한다.
  빈 실제 사용자 위젯에 예시 습관이 나타나지 않도록 갤러리 프리뷰와 실제 snapshot도 분리했다.
- Android 3행의 44dp 터치 영역과 주간 보조 문구를 위해 기본 4×3, 최소 높이 200dp로 조정했다.

### 자동 검증

- 최초 상태: TypeScript, Vitest 52개, 프로덕션 웹 export, E2E 28개 통과.
- 변경 후: TypeScript, Vitest 54개, 프로덕션 웹 export, E2E 31개 통과.
  추가 E2E는 딥링크 목적지의 일반/최소 행동·취소·재실행·자정과
  졸업/무료 한도에 따른 기록 차단을 검증한다. 네이티브 OS 링크 전달 검증을 대신하지 않는다.
- `python3 scripts/test-widget-models.py`: 실제 Swift·Kotlin 소스의 모델을 컴파일해
  각각 10가지 주 경계·연말·윤년·DST·중복·미래·공백 기간·목표 초과 사례를
  서울/UTC/뉴욕 세 시간대에서 통과. 구형 payload 기본값, 최소 행동 상태도 확인.
  Swift에서는 특수문자가 포함된 습관 ID의 URL 인코딩/복원까지 확인한다.
- 재현 환경: Xcode command-line tools, Java 및 Gradle의 Kotlin compiler가 필요하다.
  `JAVA_HOME`과 `KOTLIN_LIB`로 컴파일 도구 위치를 지정할 수 있다.
- 로그는 gitignore된 `artifacts/native-followup/`에 보관한다.

### 네이티브 빌드

- Xcode 26.6: iOS Release 시뮬레이터 앱 + HabitWidget 확장 컴파일 성공.
  2.0.0 (13), 양 타깃에 en/ko/ja/zh-TW 리소스 포함, 앱 내부 JS 번들 포함 확인.
  `/tmp/ssak-renewal-derived/Build/Products/Release-iphonesimulator/SsakHabitTracker.app`.
- 별도 `Ssak-Renewal-QA` 기기(`D2CDFA91-F02C-4D97-832B-E2A762C7FE55`)에 설치 성공.
  화면 실행/터치 검증은 아래 연결 오류로 보류. 실제 기기용 서명/Archive 빌드는 아니다.
- Android ARM64 Debug APK 컴파일 성공. 마지막 위젯 색상·크기 조정 후 재빌드까지 성공.
  `android/app/build/outputs/apk/debug/app-debug.apk`. 테스트 서명이며 스토어 제출본이 아니다.
- 커밋·푸시·스토어 배포 없음.

### 화면 검증의 제한

Computer Use 활성화·앱 재시작 이후에도 `Sky Computer Use native pipe startup failed`가
반환됐다. 네이티브 서비스에서 `Sender process is not authenticated`도 확인했다.
따라서 Simulator 화면 캡처·터치·키보드·큰 글자·VoiceOver·햅틱 검증은 미완료다.
다른 화면 제어 도구로 우회하지 않았다. 사용자의 기존 앱 기록은 변경하지 않았다.

실제 위젯의 딥링크, 자정/시간대 이동/재부팅, 홈 화면 크기별 배치도 기기 검증이 남아 있다.
빌드와 자동 검증 통과를 출시 승인으로 해석하지 않는다.

### 자체 검토

1. 제품 방향: 설정을 추가하지 않고 기존 주간 목표·최소 행동을 재사용했다.
   기존 위젯의 즉시 토글은 앱에서 명시적으로 실천 종류를 선택하는 경로로 변경되므로
   Android에서 탭 한 번이 늘어난다. 본문의 일반/최소 기록 의미를 일치시키는 선택이다.
2. 품질: 구형 snapshot 기본값, 대기 입력의 영속 저장, 중복/미래 날짜, 주 시작일,
   졸업/환불 후 권한, 특수문자 ID를 확인했다. 실제 기기에서만 검증할 수 있는 항목은 남겨뒀다.

위젯 링크 구성 참고: [Apple WidgetKit 문서](https://developer.apple.com/documentation/widgetkit/creating-a-widget-extension).

## iPhone 설치 준비

연결된 iPhone 13 mini(iOS 26.6.1, Developer Mode 활성)의 기존 1.2.0 (12) 앱 확인.
업데이트 전 앱 Library를 Mac의 `~/.ssak-device-backups/2026-10-06-before-renewal/`에
백업했고, 파일별 SHA-256 목록을 함께 보관했다. 이 백업은 Git에 포함하지 않는다.
실제 백업의 habit-store를 새 마이그레이션 함수에 통과시켜 모든 습관·기록이 동일하게
유지되고 기존 3슬롯 권한도 유지됨을 확인했다. 사용자 습관 내용은 로그에 출력하지 않았다.

자동 서명 시 Xcode가 `No Accounts`를 반환했다. 현재 개발 인증서는 유효하지만
로컬 wildcard 프로파일에는 App Groups 및 aps-environment 권한이 없다.
위젯을 포함한 전체 빌드에는 App Groups를 지원하는 프로파일이 필요하다.
다른 프로젝트의 설치 성공본을 확인해, 기존 wildcard 프로파일로 앱 단독 테스트 빌드를
서명할 수 있음을 확인했다.

서명을 제외한 iPhone용 Release 앱 + 위젯 컴파일은 성공했다.
산출물: `/tmp/ssak-renewal-device-derived/Build/Products/Release-iphoneos/SsakHabitTracker.app`.
이 원본은 서명되지 않았으며 위젯을 포함한 전체 빌드용으로 보존했다.

### 앱 단독 실기기 테스트 빌드 설치 완료

2026-10-06 14:05 KST, 기존 개발 인증서와 기기가 등록된 wildcard 프로파일로
별도 임시 사본을 서명했다. 사본에서만 위젯 확장을 제외하고, App Groups 및 push
entitlement 없이 서명했다. 저장소의 위젯 구현과 전체 빌드 설정은 그대로 유지했다.
중첩 프레임워크 및 앱의 codesign strict 검증 통과 후 devicectl 업데이트 설치 성공.
기기 앱 목록에서 **Ssak: Habit Tracker 2.0.0 (13)** 확인.
기존 앱 삭제 없이 같은 bundle identifier로 업데이트했고, 설치 직후 AsyncStorage의
모든 파일 SHA-256이 설치 전 백업과 동일함을 확인했다. 실기기 첫 실행 후 마이그레이션은
아직 검증하지 않았다.

자동 실행 요청은 기기 잠금(`FBSOpenApplicationErrorDomain: Locked`)으로 거부됐다.
사용자가 iPhone 잠금을 풀고 앱을 열어야 한다. 화면 QA는 아직 미완료다.
이번 설치본은 앱 화면·습관 기록 테스트용이며 홈 화면 위젯과 App Group 공유를
검증할 수 없다. push entitlement도 없으며 알림·구매 검증 완료를 의미하지 않는다.

설치 결과: `/tmp/ssak-device-install-result.json`.
버전 확인: `/tmp/ssak-device-app-after.json`.
실행 결과: `/tmp/ssak-device-launch-result.json`.
서명된 임시 앱 경로는 `/tmp/ssak-device-app-only-path.txt`에 기록했다.


## 2026-10-06 이용 상태 단순화 작업계획

사용자 결정에 따라 기존 사용자 3슬롯 예외를 폐지하고 무료 1개 / 구매 Plus 3개만 유지한다.
1. 저장소 v3 마이그레이션으로 기존 습관·기록·무료 선택·위젯 처리 ID를 보존하고 과거 권한 플래그를 제거한다.
2. 내 습관·설정의 구매 유도 배지를 실제 무료/Plus 이용 상태로 바꾸고, 오늘은 날짜를 유지한다.
3. 4개 언어 안내와 정책 문구를 맞추고 마이그레이션·구매 권한·표시 회귀 검증 후 기기 테스트 빌드를 갱신한다.

### Plan simplification completed

- Free: one active habit. Purchased Plus: up to three. Legacy access no longer grants slots.
- Schema v3 preserves habits, logs, the free selection and widget replay IDs. Missing completion timestamps become null.
- My habits and Settings show actual plan status. Today retains the date. Paid Settings links to benefits instead of an upgrade CTA.
- Updated app copy and policy descriptions in all four languages, and the review guide.
- Passed typecheck, 54 unit tests, 40 E2E tests, web export and iPhone Release build.
- E2E covers v1/v2 migration and all four languages' free/Plus labels before and after deletion, reload and desktop resizing. Inspected Korean 360px free/Plus screenshots.
- Fresh device Library backup: `~/.ssak-device-backups/2026-10-06-before-plan-v3/`. Its one active habit and all logs survive migration unchanged.
- Installed updated app-only 2.0.0 (13) on the iPhone at 14:19 KST. Widget remains excluded from this test build.
- Install evidence: `/tmp/ssak-plan-v3-install-result.json`; signed app path: `/tmp/ssak-plan-v3-app-path.txt`.

Review: plan status follows purchase entitlement, never habit count. Nonselected free habits remain readable; changing the selection does not delete records. The earlier legacy-slot preservation notes describe the previous build and are superseded by this change.

Physical-device launch succeeded. Read back AsyncStorage after launch: schema v3, legacy flag absent, and habits/logs identical to the immediate pre-update backup. Native visual/touch QA and real purchase testing remain unverified.

## Fresh-device test reset (2026-10-06 14:45 KST)

User approved resetting this iPhone's test records for a new-user walkthrough. Backed up all AsyncStorage files and verified habit/log data plus file hashes at `/Users/daniel/.ssak-device-backups/2026-10-06-144453-before-clean-start`. The Library-wide copy encountered a protected OS SplashBoard snapshot; the dedicated AsyncStorage backup succeeded. Uninstalled only `com.qlemql.minimalhabittracker` and reinstalled the same signed app-only 2.0.0 (13) test build. Automatic launch was denied because the iPhone was locked; the user must unlock it and open the app. No production reset behavior was added. Evidence: `/tmp/ssak-clean-start-install.json`, `/tmp/ssak-clean-start-files.json`.

## 2026-10-07 automatic initial language

Plan: remove language controls from the welcome screen, retain the existing device-language default and Settings override, and verify first-run localization plus persistence before updating the iPhone test build. No country/GPS lookup is needed.

Completed: welcome-screen language buttons and their unused styles removed. Existing `getLocales()` default remains: Korean, Japanese and Chinese (Traditional UI), otherwise English; Settings overrides remain persisted. Browser tests now start fresh under each supported device locale rather than clicking a welcome language button. Added an unsupported-locale fallback flow and verified a Settings language change survives reload.

Validation: typecheck, web export and unsigned iPhone Release build passed. The 41-scenario browser suite had 40 passes and one new assertion failure because the web radio did not expose `aria-checked`; changed that assertion to the visible localized Settings tab and reran the affected scenario successfully. No app implementation change was required for that assertion.

Device installation pending: the paired iPhone currently reports its tunnel as unavailable. Its records were not reset or modified for this change.

## 2026-10-08 위젯 디자인 검토와 다음 작업

- [iOS·Android 위젯 비교 시안](design/widget-comparison/index.html): 브라우저에서 파일을 열면 두 플랫폼을 나란히 비교하고 이미지를 확대할 수 있다. PNG는 생성형 디자인 시안이며 실제 기기 캡처가 아니다.
- Dynamic Island는 사용자가 시작한 짧은 습관 세션을 표시하는 추가 아이디어다. 길게 눌러 진행 시간과 남은 시간을 확인 → ‘앱에서 기록’ → 앱에서 ‘작게 완료 / 완료’를 직접 선택하는 흐름으로 문구와 시안을 맞췄다. 기록 선택은 미리보기이며 실제 저장하지 않는다.
- 비교 화면의 이미지 로딩·확대·Esc 닫기, 기록 선택·초기화와 320px 모바일 배치를 브라우저에서 검증했다. 네이티브 위젯이나 Live Activity 구현 완료를 의미하지 않는다.
- 다음 순서: iOS 소형/중형/잠금 화면 디자인 반영 → App Groups 서명과 위젯 포함 실기기 검증 → Android 크기별 구성 → 결제 연결과 출시 검증. 진행 세션과 Live Activity는 기본 위젯 이후 별도 개발 범위다.
