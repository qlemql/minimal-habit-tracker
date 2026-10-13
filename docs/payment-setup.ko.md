# 싹 iOS 및 Google Play 결제 설정 체크리스트

## 2026-10-13 사용자 테스트 확인 — 아래 이전 준비 기록보다 우선

- Android 2.0.0(12): Play 설치 후 ₩4,900 조회, sandbox 구매와 Plus 활성화, 앱 재실행 후 유지 확인. 습관 3개 추가와 기존 설치에서 구매 복원은 사용자 확인 완료. 재설치 후 복원·네 번째 습관 차단은 별도 미확인.
- Android 테스트 주문은 Play Console에서 환불됨. RC 권한 해제와 앱의 무료 전환·기록 보존은 아직 대기 중이며 자격 삭제 처리 여부도 최종 주문 상세로 확인한다.
- iOS 2.0.0(14): TestFlight 업로드·실기기 설치 완료. 상품 조회 실패 상태이며 유료 앱 계약에 필요한 은행/세금 정보 제출 후 처리 대기 중(사용자 보고).
- Apple/Google 서버 알림은 연결·수신 미확인. 파일 백업과 오늘 탭 UI 개선 후 설정할 예정.
- 파일 백업 기능은 새 코드에 반영됨. 현재 배포된 12/14 빌드는 기존 클립보드 방식이며 새 빌드에서 기기 파일 저장·복원 확인이 필요하다.
- 파일 백업·오늘 탭 개선을 포함한 Android 2.0.0(13) AAB와 iOS 2.0.0(15) IPA 생성 및 서명/버전/결제 키/신규 네이티브 모듈 포함 검증 완료. 위치는 `artifacts/backup-ui-build-2026-10-13/`. 이 새 빌드의 스토어 업로드·설치는 아직 미확인이다.

## 2026-10-14 이어서 할 일

1. **스토어 → RevenueCat 서버 알림 설정**: Google RTDN과 Apple 서버 알림을 연결하고 테스트 수신을 확인한다. 사용자에게 보내는 푸시 알림 설정과 구분한다.
2. **Android 환불 반영 확인**: Play 주문 상세에서 자격 삭제 여부, RC 해당 고객의 `ssak_plus` 권한 해제, 앱의 무료 전환을 순서대로 확인한다. 기존 세 습관과 기록은 보존되고 무료로 사용할 한 습관을 선택할 수 있는지도 확인한다.
3. **App Store 결제 준비 상태 확인**: 유료 앱 계약·은행·세금 정보 처리 상태를 확인한 뒤 TestFlight에서 상품 가격 조회 → 샌드박스 구매 → 재실행 → 구매 복원을 검증한다. 결제 화면이 정상 표시되면 앱 내 구입 심사용 스크린샷과 남은 필수 정보를 채운다.
4. **새 빌드 확인**: Android 13/iOS 15를 각각 내부 테스트/TestFlight에 업로드하고 설치한다. 실제 기기 파일 저장·공유 → 파일 선택 → 정보 미리보기 → 취소/교체 복원, 오늘 탭 습관 1/2/3개 구성을 확인한다. 테스트 전에 현재 기록을 백업한다.


기준일: 2026-10-13 · 개발 브랜치: `feat/ssak-renewal`

싹은 무료로 습관 1개를 기록하고, **Ssak Plus를 한 번 구매하면 최대 3개와 백업·복원을 이용하는 방식**이다. 아래 순서대로 스토어 상품을 만들고 RevenueCat에 연결한 뒤, 테스트 결제로 실제 권한 변화를 확인한다. 체크박스는 작업을 완료한 뒤 표시한다.

## 현재 상태와 작업 순서

구매·복원·환불 후 무료 전환 코드는 구현돼 있다. 로컬 `.env.local`과 EAS `production` 환경에 iOS·Android 공개 SDK 키를 설정했다. Google Play 상품은 활성화했고 RevenueCat 권한과 Lifetime 패키지에 연결했으며 Android 샌드박스 구매·권한 유지까지 사용자 확인을 마쳤다. 환불 후 권한 해제와 iOS 결제는 미확인이다. iOS 비소모성 상품 `ssak_plus_lifetime_`을 생성했고, 사용자 제공 화면에서 `ssak_plus` 권한과 `default → $rc_lifetime` 패키지 연결을 확인했다. iOS 판매 지역은 10개이며 최종 지역별 가격과 심사용 스크린샷은 추가 확인이 필요하다.

Android 초기 등록용 `2.0.0 (11)`은 SDK 키가 없는 AAB였다. 결제 테스트용 `2.0.0 (12)`는 `artifacts/billing-test-2026-10-13/ssak-2.0.0-12.aab`에 보존했다. Android 키 포함, BILLING 권한, v11과 동일한 업로드 인증서, 서명 및 16KB 정렬을 검증했고 이후 Play 설치·샌드박스 구매를 확인했다. 최신 파일 백업 테스트용은 위의 `2.0.0 (13)`이다.

iOS 결제 테스트용 `2.0.0 (14)` App Store 배포 IPA는 `artifacts/billing-test-2026-10-13/ssak-2.0.0-14.ipa`에 보존했다. 실제 iOS 공개 SDK 키 포함, 앱·위젯 버전 일치, 양 타깃 App Group, 배포 프로파일과 서명 검증을 통과했다. EAS 빌드: https://expo.dev/accounts/daniel_hyun/projects/minimal-habit-tracker/builds/3541c398-a917-4da4-8c19-67457f0a6394. TestFlight 업로드·실기기 설치까지 완료했으며 실제 샌드박스 구매·복원은 대기 중이다. 최신 파일 백업 테스트용은 위의 `2.0.0 (15)`다.

1. 판매 가격과 상품 ID 확정
2. RevenueCat 프로젝트 및 플랫폼 앱 준비
3. Apple 상품 등록과 연결
4. Google 상품 등록과 연결
5. 앱 빌드 환경에 공개 SDK 키 반영
6. 플랫폼별 테스트 결제와 복원·환불 확인
7. 스토어 심사 및 출시 준비

iOS부터 진행해도 된다. 각 플랫폼 테스트는 해당 스토어 상품과 키가 준비되면 시작할 수 있다.

## 그대로 사용할 값과 결정할 값

| 항목 | 값 | 적용 기준 |
|---|---|---|
| iOS Bundle ID | `com.qlemql.minimalhabittracker` | 현재 앱과 동일하게 입력 |
| Android Package name | `com.qlemql.minimalhabittracker` | 현재 앱과 동일하게 입력 |
| App Store 앱 ID | `6762334017` | 기존 앱 레코드 확인용 |
| 상품 표시명 | `Ssak Plus` | 각 언어 설명 추가 |
| RevenueCat Entitlement | `ssak_plus` | 코드가 확인하는 권한 이름이므로 정확히 일치 |
| Offering ID | `default` | 이름은 변경 가능하지만 기본 Offering으로 지정 |
| Package | `Lifetime` | 기본 Offering의 Lifetime 패키지를 코드가 조회 |
| iOS 상품 ID | `ssak_plus_lifetime_` | 끝의 밑줄 포함. Apple ID `6822161773`; 비소모성 상품 |
| Google 상품 ID | `ssak_plus_lifetime` | 활성화된 비소모성 상품; 구매 옵션 `lifetime` |
| 판매 가격 | 한국 ₩4,900 | 해외 가격은 각 스토어 콘솔에서 확인; iOS 가격 등록 예정 |
| 판매 국가 | 한국·미국·영국·캐나다·호주·뉴질랜드·일본·대만·홍콩·마카오 | Google Play 10개 지역 활성화; iOS도 같은 범위로 준비 |

iOS에서 처음 생성한 소모성 `ssak_plus_lifetime`은 삭제했다. Apple은 삭제한 상품 ID의 재사용을 허용하지 않으므로 iOS는 끝에 밑줄이 붙은 `ssak_plus_lifetime_`을 사용한다. Android 상품 ID는 기존 `ssak_plus_lifetime`을 유지한다. RevenueCat에 플랫폼별 정확한 ID로 등록한다.

상품 ID와 `ssak_plus`는 서로 다른 값이다. 상품은 결제 대상이고, Entitlement는 구매 결과로 부여할 앱 이용 권한이다. 두 스토어의 상품 ID는 같아도 되고 달라도 되며, 각각 같은 권한에 연결한다. [RevenueCat 상품과 권한 구성](https://www.revenuecat.com/docs/projects/configuring-products)

현재 앱에는 공통 로그인 계정이 없다. iOS와 Android 사이의 Plus 구매 공유는 제공하지 않으며, 구매 복원은 같은 플랫폼의 구매 계정으로 확인한다. 구매 복원은 습관 기록 복원이 아니다. 기록 이동은 별도 백업·복원을 사용한다.

## 공통 준비

- [ ] [App Store Connect](https://appstoreconnect.apple.com/), [Google Play Console](https://play.google.com/console/), [RevenueCat](https://app.revenuecat.com/)에 접근할 수 있다.
- [ ] 판매 가격과 국가를 정했다.
- [x] RevenueCat에 싹 프로젝트를 만들거나 기존 프로젝트를 확인했다.
- [x] 같은 프로젝트 안에 App Store 앱과 Google Play 앱을 각각 등록했다.
- [ ] 플랫폼 앱 식별자가 위 표의 값과 일치한다.
- [x] `ssak_plus` Entitlement를 만들었다.
- [x] 기본 Offering을 만들고 Lifetime 패키지를 준비했다.

플랫폼별 상품을 만든 뒤 해당 패키지에 iOS 상품과 Google 상품을 각각 연결한다. 운영용 패키지에는 실제 스토어 상품을 사용한다. RevenueCat Test Store는 개발용 테스트 환경이며 스토어 결제 검증을 대신하지 않는다. [RevenueCat 설정 순서](https://www.revenuecat.com/docs/projects/configuring-products)

## iOS 설정

### Apple 판매 계약과 상품 등록

- [ ] App Store Connect의 Business에서 Paid Apps Agreement가 **Active**인지 확인했다.
- [ ] 정산 계좌와 필요한 세금 정보를 등록했다. 샌드박스 테스트에도 활성 계약이 필요하다. [Apple 결제 준비](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/)
- [x] 기존 싹 앱을 열어 In-App Purchases에서 상품을 추가했다.
- [x] 유형을 **Non-Consumable 비소모성**으로 선택했다.
- [ ] 확정한 상품 ID, 참조 이름, 표시명·설명·가격·판매 국가를 입력했다.
- [ ] 심사용 스크린샷과 필수 정보를 채우고 상품 상태에 누락 항목이 없는지 확인했다.

싹 Plus는 구매할 때마다 소모되는 상품이나 구독으로 등록하지 않는다. [Apple 상품 등록](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-consumable-or-non-consumable-in-app-purchases)

### Apple과 RevenueCat 연결

- [ ] RevenueCat의 App Store 앱 설정에서 **In-App Purchase Key**를 등록했다. Apple에서 발급한 `.p8`, Key ID, Issuer ID를 해당 필드에 입력한다. [구매 검증용 키 설정](https://www.revenuecat.com/docs/service-credentials/itunesconnect-app-specific-shared-secret/in-app-purchase-key-configuration)
- [ ] 상품 자동 가져오기를 사용한다면 별도의 **App Store Connect API Key**를 연결했다. 구매 검증용 키와 상품 가져오기용 키를 구분한다. 자동 가져오기를 사용하지 않으면 상품 ID로 직접 등록한다. [Apple 서비스 키 구분](https://www.revenuecat.com/docs/store-configuration/app-store/service-credentials-index)
- [x] Product catalog → Products에서 Apple 상품 `ssak_plus_lifetime_`을 수동 추가했다.
- [x] 상품을 `ssak_plus` Entitlement에 연결했다.
- [x] 기본 Offering → Lifetime 패키지의 iOS 상품으로 지정했다.
- [x] RevenueCat의 iOS 공개 SDK 키를 확보했다. 앱 환경 변수에는 이 키를 사용한다.

### Apple 환불 알림 연결

- [ ] RevenueCat 앱 설정의 Apple Server Notification URL을 확인했다.
- [ ] App Store Connect → App Information → App Store Server Notifications의 **Production과 Sandbox 양쪽**에 URL을 등록했다.
- [ ] 알림 버전은 **Version 2**로 설정했다.
- [ ] RevenueCat에서 테스트 알림 또는 테스트 거래 이벤트 수신을 확인했다.

RevenueCat의 자동 적용 버튼을 사용할 수도 있다. 비소모성 구매의 환불 반영까지 테스트하려면 서버 알림도 함께 준비한다. [Apple 서버 알림 연결](https://www.revenuecat.com/docs/platform-resources/server-notifications/apple-server-notifications), [비구독 구매 처리](https://www.revenuecat.com/docs/platform-resources/non-subscriptions)

### iOS 테스트 배포

- [ ] 키를 반영한 앱을 올바른 서명으로 빌드하고 TestFlight에 업로드했다.
- [ ] TestFlight 빌드를 설치해 테스트 구매를 진행했다.
- [ ] 개발 빌드에서 Apple 샌드박스를 사용할 경우 Sandbox Apple Account를 준비했다.
- [ ] 아래 공통 테스트 표를 iOS에서 실행했다.

TestFlight 구매는 샌드박스에서 처리된다. 기존에 직접 설치했던 위젯 제외 UI 테스트 빌드는 결제 검증 완료본이 아니다. [Apple 및 TestFlight 테스트](https://www.revenuecat.com/docs/test-and-launch/sandbox/apple-app-store)

처음 제출하는 비소모성 인앱 구입이면 새 앱 버전과 함께 심사에 제출한다. 기존 싹 앱이 출시돼 있어도 첫 비소모성 상품 제출에는 이 절차를 확인한다. [Apple 인앱 구입 심사 제출](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase)

## Google Play 설정

### 결제 프로필과 상품 등록

- [ ] Play Console의 결제 프로필과 정산 정보를 준비했다. [Google 결제 프로필과 상품 준비](https://support.google.com/googleplay/android-developer/answer/1153481?hl=ko)
- [ ] 기존 싹 앱에서 수익 창출 관련 메뉴의 **일회성 제품 One-time products**를 열었다.
- [ ] 확정한 상품 ID와 표시명·설명을 입력했다.
- [ ] 구매 옵션을 **Buy 구매**로 설정했다.
- [ ] 가격과 판매 국가를 설정하고 상품·구매 옵션을 활성화했다.
- [ ] RevenueCat 자동 가져오기를 사용할 경우 구매 옵션의 하위 호환 설정을 확인했다. 현재 자동 가져오기는 하위 호환 일회성 상품을 대상으로 하며, 그 외에는 수동 등록 경로를 확인한다.

[Google 일회성 제품 설정](https://support.google.com/googleplay/android-developer/answer/16430488?hl=ko), [RevenueCat 상품 가져오기](https://www.revenuecat.com/docs/offerings/products-overview)

### Google 서비스 계정 연결

Google 서비스 계정은 RevenueCat이 Google에 구매 내역을 확인할 때 사용한다.

- [ ] [Google Cloud Console](https://console.cloud.google.com/)에서 사용할 프로젝트를 선택했다.
- [ ] Google Play Android Developer API, Google Play Developer Reporting API, Pub/Sub를 활성화했다.
- [ ] RevenueCat용 서비스 계정을 만들고 공식 안내에 따라 Pub/Sub Editor와 Monitoring Viewer 역할을 설정했다.
- [ ] 서비스 계정 JSON 키를 발급했다.
- [ ] Play Console → 사용자 및 권한에서 JSON의 `client_email`을 초대하고 싹 앱 접근을 설정했다.
- [ ] RevenueCat 공식 안내의 권한을 확인했다: 앱 정보·일괄 보고서 읽기, 재무 데이터·주문·취소 설문 읽기, 주문·구독 관리, 스토어 등록정보 관리.
- [ ] RevenueCat → Google Play 앱 → Service Account Credentials JSON에 키를 등록했다.
- [x] RevenueCat의 인증 정보 검증 결과가 정상인지 확인했다.

새 인증 정보는 반영에 시간이 걸릴 수 있다. 오류가 있으면 먼저 서비스 계정 이메일, API 활성화, Play 권한, 앱 패키지를 대조한다. [서비스 계정 설정과 문제 해결](https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials)

### Google 상품과 권한 연결

- [x] RevenueCat에 Google 상품을 가져오거나 실제 상품 ID로 추가했다.
- [ ] **RevenueCat 상품 유형을 Non-consumable로 지정했다.** 이 설정을 놓치면 구매가 소비 처리돼 재구매가 가능해질 수 있다.
- [x] 상품을 `ssak_plus` Entitlement에 연결했다.
- [x] 기본 Offering → Lifetime 패키지의 Android 상품으로 지정했다.
- [x] RevenueCat의 Android 공개 SDK 키를 확보했다.

[RevenueCat Google 비소모성 상품 설정](https://www.revenuecat.com/docs/getting-started/entitlements/android-products)

### Google 환불 알림 연결

- [ ] RevenueCat의 Google Play 앱 설정에서 Pub/Sub 토픽을 선택하거나 생성하고 연결했다.
- [ ] 토픽 이름을 Play Console의 Monetization setup → Real-time developer notifications에 등록했다.
- [ ] 알림 내용에 **voided purchases와 모든 one-time products**가 포함되도록 선택했다.
- [ ] Play Console에서 테스트 알림을 전송하고 RevenueCat의 최근 수신 시각을 확인했다.

일회성 구매의 환불·취소 상태를 RevenueCat에 자동 반영하기 위한 설정이다. [Google 실시간 개발자 알림 연결](https://www.revenuecat.com/docs/platform-resources/server-notifications/google-server-notifications)

### Android 테스트 배포

- [ ] Android 공개 SDK 키를 반영한 서명 AAB를 내부 테스트 트랙에 업로드했다.
- [x] 사용할 Google 계정을 내부 테스트 참여자로 등록했다.
- [x] **같은 계정을 라이선스 테스터에도 등록했다.**
- [ ] 테스트 참여 링크를 수락하고 해당 계정으로 Play Store에서 앱을 설치했다.
- [ ] 구매창에 테스트 결제수단이 표시되는지 확인한 뒤 테스트했다.
- [ ] 아래 공통 테스트 표를 Android에서 실행했다.

내부 테스트 참여와 라이선스 테스트는 별도 설정이다. 내부 테스트 사용자라도 라이선스 테스터가 아니면 실제 요금이 청구될 수 있다. [Google Billing 테스트](https://developer.android.com/google/play/billing/test)

## 앱 빌드에 키 반영

저장소 루트의 `.env.local`에 **RevenueCat 플랫폼별 공개 SDK 키**를 넣는다. 아래 값은 자리표시자이므로 실제 키로 교체한다. 기존 파일이 있다면 다른 값을 유지하면서 두 항목만 추가·수정한다.

```dotenv
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_REPLACE_WITH_IOS_PUBLIC_SDK_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_REPLACE_WITH_ANDROID_PUBLIC_SDK_KEY
```

- [x] Apple 키와 Google 키의 플랫폼을 확인했다.
- [x] EAS `production` 프로젝트 환경에 두 공개 SDK 키를 `sensitive`로 등록하고 production 빌드 프로필에 환경을 명시했다. 키 값은 문서나 Git에 기록하지 않는다.
- [x] 환경 변수 변경 후 iOS 2.0.0 (14), Android 2.0.0 (12)를 빌드하고 각 플랫폼 키가 실제 번들에 포함된 것을 확인했다.
- [ ] 앱의 Plus 화면에서 스토어가 반환한 실제 가격이 보이는지 확인했다.

`.p8`와 Google 서비스 계정 JSON은 스토어와 RevenueCat 연결용 비밀 인증 정보다. 위 `EXPO_PUBLIC_` 변수나 앱 소스에 넣지 않는다. `.env.local`은 현재 저장소의 Git 제외 대상이다.

현재 코드의 연결 지점:

| 파일 | 역할 |
|---|---|
| [types.ts](../src/billing/types.ts) | 제공자 공통 상품·권한·오류 및 `BillingProvider` 계약 |
| [service.ts](../src/billing/service.ts) | 구매·복원·조회 결과 반영, 늦은 조회 응답과 종료된 구독 콜백 방어 |
| [revenueCat.ts](../src/billing/revenueCat.ts) | SDK 초기화, Lifetime 조회·구매·복원·권한 수신과 공통 형식 변환 |
| [billing.ts](../src/renewal/billing.ts) | 제공자 선택 및 앱 Plus 저장소 연결; 화면·런타임의 공통 진입점 |
| [plus.tsx](../app/plus.tsx) | 스토어 가격 표시, 구매·복원 버튼, 승인 대기 안내 |
| [proStore.ts](../src/store/proStore.ts) | 마지막으로 확인한 Plus 상태 저장 |
| [Runtime.tsx](../src/renewal/Runtime.tsx) | 앱 실행·복귀 시 구매 동기화 및 변경 수신 |
| [.env.example](../.env.example) | 필요한 환경 변수 이름 |
| [eas.json](../eas.json) | 테스트·스토어 빌드 프로필 |

상품 ID를 앱에 직접 하드코딩하는 구조가 아니다. RevenueCat 어댑터는 `offerings.current.lifetime`을 읽고, 구매 이후 `customerInfo.entitlements.active.ssak_plus`로 권한을 판단한다. Lifetime 패키지와 비구독 카테고리/구독 기간을 확인해 구독 상품을 차단한다. 이 검사는 소비성/비소비성 설정까지 보증하지 않으므로 콘솔의 Non-consumable 설정도 반드시 확인한다.

화면은 SDK 패키지 대신 `LifetimeProduct`의 스토어 상품 ID와 현지 가격 문자열만 받는다. 해당 상품 객체는 현재 실행 중 조회한 객체를 구매 시 그대로 전달하며 저장소나 백업에 직렬화하지 않는다. 어댑터가 원본 패키지를 보관하므로 Offering 문맥을 유지하고 임의의 상품 ID로 구매하지 않는다.

오류는 `BillingError`의 `cancelled` / `pending` / `unavailable` / `invalid-product` / `failed`로 변환한다. 구매 취소는 조용히 종료하고 대기는 승인 전 권한을 부여하지 않는다. 통신 실패나 키 미설정으로 마지막 확인 권한을 지우지 않으며, 정상 조회/알림에서 Plus 비활성이 확인되면 회수한다. SDK 원본 오류/구매 토큰은 UI나 로그로 전달하지 않는다.

### 향후 제공자 교체 범위

다른 제공자는 `BillingProvider`를 구현하고 `src/renewal/billing.ts`에서 선택한다. UI·습관 개수 판단·위젯·Plus 저장 형식은 해당 제공자의 SDK를 알 필요가 없다. 이 경계는 코드 교체를 줄이기 위한 것으로, 자체 서버 또는 구매 데이터 이전을 구현한 것은 아니다.

실제 전환 시에는 같은 스토어 앱/상품을 유지하고 기존 사용자·거래 식별 정보, 구매 복원, 환불 알림을 새 시스템에 연결해야 한다. 회원가입 없는 현재 구조의 익명 사용자 연결도 검증한다. 일반 거래 내보내기에는 원본 Google 구매 토큰이 없으므로 필요하면 RevenueCat 지원팀에 이전용 데이터를 요청한다. 새 버전 검증과 구버전 대응을 끝내기 전에 기존 프로젝트를 삭제하지 않는다. [RevenueCat 이전 안내](https://www.revenuecat.com/docs/revenuecat-support/common-tickets/export-data-or-migrate-away)

## 공통 테스트와 완료 기준

테스트 계정과 테스트 기록으로 진행한다. 재설치 시 습관 기록이 사라질 수 있으므로 보관할 기록은 먼저 백업한다.

| 테스트 | 기대 결과 | iOS | Android |
|---|---|---|---|
| 무료로 시작 | 습관 1개 기록 가능, 두 번째 추가 시 Plus 안내 | [ ] | [ ] |
| 상품 조회 | 해당 스토어의 현지 가격·통화 표시 | [ ] | [ ] |
| 구매 성공 | RevenueCat에 거래 기록, `ssak_plus` 활성화, 앱에 Plus 이용 중 표시 | [ ] | [ ] |
| 구매 취소·실패 | 무료 상태 유지, 재시도 가능 | [ ] | [ ] |
| 결제 승인 대기 | 승인 전 Plus 미부여, 중복 구매 방지; 재현 가능한 테스트 환경에서 확인 | [ ] | [ ] |
| Plus 한도 | 최대 3개 허용, 네 번째 추가 차단 | [ ] | [ ] |
| 앱 재실행 | 구매 상태 재확인 후 Plus 유지 | [ ] | [ ] |
| 재설치 후 구매 복원 | 같은 스토어 구매 계정으로 Plus 복원, 기록 복원과 구분 | [ ] | [ ] |
| 백업·복원 | Plus에서 사용 가능, 복원 후 습관·기록 확인 | [ ] | [ ] |
| 환불·권한 회수 | 새 구매 상태 수신 후 Plus 해제, 남은 습관·기록 보존 | [ ] | [ ] |
| 환불 후 여러 습관 | 무료로 계속 기록할 1개 선택, 나머지는 읽기 가능 | [ ] | [ ] |
| 오프라인·복귀 | 통신 실패 안내·기존 상태 유지가 자연스럽고, 연결 후 최신 구매 상태 반영 | [ ] | [ ] |

환불 이벤트와 앱 반영 사이에는 서버 처리·캐시·오프라인에 따른 지연이 있을 수 있다. 대시보드 이벤트 시각과 앱이 새 상태를 받은 시각을 함께 기록한다. 코드 테스트 통과와 실제 스토어 검증 완료는 별도로 관리한다.

## 막혔을 때 확인할 순서

| 증상 | 먼저 확인할 내용 |
|---|---|
| 구매 버튼 비활성 또는 상품 없음 | 빌드에 SDK 키 반영 → 플랫폼 앱 ID → 기본 Offering → Lifetime 연결 → 상품 활성화·계약·판매 지역 |
| Google 상품 자동 가져오기 실패 | 일회성 구매 옵션의 하위 호환 설정과 실제 상품 ID; 필요하면 수동 등록 |
| Google 인증 정보 오류 | API 활성화, 서비스 계정 `client_email`, Play 권한, 인증 정보 반영 대기 |
| 결제 성공 후 Plus 미활성 | 거래가 기록된 RevenueCat 고객과 앱 → 상품의 `ssak_plus` 연결 → SDK 최신 구매 상태 |
| 복원했지만 기록이 없음 | 구매 복원은 이용 권한만 복원; 습관은 별도 백업으로 복원 |
| Android에서 이미 산 Plus를 다시 살 수 있음 | RevenueCat Google 상품 유형이 Non-consumable인지 확인 |
| 환불 후 계속 Plus로 보임 | 서버 알림 수신 → RevenueCat 권한 → 앱 온라인 복귀 후 동기화 순서 확인 |
| 테스트인데 일반 결제수단만 표시 | 테스트 중단 후 Google 라이선스 테스터 계정과 설치 계정 일치 여부 확인 |

## 작업 기록

비밀 키 값은 기록하지 않고 설정 완료 여부와 콘솔 링크만 남긴다.

| 항목 | 기록 |
|---|---|
| 확정 가격과 기준 통화 | 미정 |
| 판매 국가 | 한국·미국·영국·캐나다·호주·뉴질랜드·일본·대만·홍콩·마카오 |
| Apple 실제 상품 ID | `ssak_plus_lifetime_` (끝 밑줄 포함) |
| Google 실제 상품 ID | `ssak_plus_lifetime` |
| RevenueCat 프로젝트 링크 | https://app.revenuecat.com/projects/d436ed37 |
| Apple 설정 완료일 | 입력 |
| Google 설정 완료일 | 입력 |
| 테스트용 빌드 번호 | iOS 2.0.0 (14), Android 2.0.0 (12); 파일 검증 완료, 스토어 결제 미검증 |
| iOS 테스트 결과와 남은 문제 | IPA 서명·키·위젯 검증 통과. TestFlight 업로드 및 가격 조회·구매·복원·환불 테스트 남음 |
| Android 테스트 결과와 남은 문제 | AAB 구조·서명·키 검증 통과. v12 내부 테스트 업로드 및 가격 조회·구매·복원·환불 테스트 남음 |

스토어 업로드 전에는 기존에 사용한 iOS build number와 Android versionCode를 확인해 새 번호를 정한다. 실제 스토어 가격, 구매 복원, 환불 후 권한 반영을 검증한 뒤 결제 준비 완료로 판단한다. 전체 출시 점검은 [출시 준비 문서](launch-preparation.md)에서 이어간다.
