# 2026-11-02 RevenueCat 결제 현황

사용자 로그인 후 Ssak: Three Habits 프로젝트(d436ed37)의 Overview와 Customers를 읽기 전용으로 확인했다. 상품·권한 부여·환불·설정을 변경하지 않았다. 샌드박스 보기 필터는 확인 후 원래 운영 데이터 보기로 복원했다.

## 운영 데이터

- Overview 최근28일(링크 범위10/5~11/2) Revenue $0, Recent transactions: No live transactions to show.
- Customers의 Non-subscription 필터(Has made non-subscription purchase = True): 고객0, 총매출$0.
- All customers: 30, 총매출$0. Overview New Customers27, Active Customers30. 이 수치를 실제 독립 사용자·설치·습관 첫 기록·마케팅 참가자 수로 해석하지 않는다. 개발/심사/재설치 여부를 분리하지 않았다.
- Active Subscriptions0·MRR$0. 싹은 일회성 구매이므로 구독 지표만으로 Plus 구매 유무를 판단하지 않고 비구독 구매 필터를 별도 확인했다.

## 샌드박스

- 최근28일 표시 매출$6.63은 테스트 금액이며 실매출이 아니다.
- iOS 10/15 17:32 KST: ₩4,900 테스트 구매. ssak_plus 권한 Active · unlimited duration.
- iOS 10/16 17:20 KST: US$2.99 테스트 구매. ssak_plus 권한 Active · unlimited duration.
- Android 10/13 16:17 KST: ₩4,900 테스트 구매 → 같은 날21:45 KST 환불 이벤트. Total Spent USD0, No current entitlements 확인.
- 두 iOS 상세에 환불 이벤트는 표시되지 않았다. iOS 환불 동작 검증 완료를 뜻하지 않는다. Android는 RC 환불·권한 회수 상태를 확인했지만 오늘 실제 기기 구매/복원/환불 테스트는 하지 않았다.

과거 테스트 구매와 Android 환불 반영 근거는 확인했다. 실구매0이라는 사실만으로 현재 출시 빌드 결제 기능에 문제가 있다고 판단할 수 없다. 서버 알림 연결·최신 출시 빌드 실기기 구매 전 과정은 이번 조회 범위 밖이다.

[운영 대시보드](https://app.revenuecat.com/projects/d436ed37/overview) · [운영 데이터 증빙](revenuecat-live.png)
