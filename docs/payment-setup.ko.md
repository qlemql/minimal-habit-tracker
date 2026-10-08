# 싹 iOS 및 Google Play 결제 설정 체크리스트

기준일: 2026-10-08 · 개발 브랜치: `feat/ssak-renewal`

싹은 무료로 습관 1개를 기록하고, **Ssak Plus를 한 번 구매하면 최대 3개와 백업·복원을 이용하는 방식**이다. 아래 순서대로 스토어 상품을 만들고 RevenueCat에 연결한 뒤, 테스트 결제로 실제 권한 변화를 확인한다. 체크박스는 작업을 완료한 뒤 표시한다.

## 현재 상태와 작업 순서

구매·복원·환불 후 무료 전환 코드는 구현돼 있다. 로컬 빌드 환경에는 iOS·Android RevenueCat 공개 SDK 키가 아직 없고, 실제 스토어 결제는 미검증이다. 콘솔에 이미 등록된 상품이 있다면 먼저 확인하고 재사용 여부를 결정한다.

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
| Offering ID | `default` 제안 | 이름은 변경 가능하지만 기본 Offering으로 지정 |
| Package | `Lifetime` | 기본 Offering의 Lifetime 패키지를 코드가 조회 |
| iOS 상품 ID | `ssak_plus_lifetime` 제안 | 생성 전 확정; 이미 상품이 있으면 실제 ID 사용 |
| Google 상품 ID | `ssak_plus_lifetime` 제안 | 생성 전 확정; 이미 상품이 있으면 실제 ID 사용 |
| 판매 가격 | **미정** | 스토어별 기준 가격과 현지 가격 확인 |
| 판매 국가 | **미정** | 출시 범위에 맞춰 선택 |

상품 ID와 `ssak_plus`는 서로 다른 값이다. 상품은 결제 대상이고, Entitlement는 구매 결과로 부여할 앱 이용 권한이다. 두 스토어의 상품 ID는 같아도 되고 달라도 되며, 각각 같은 권한에 연결한다. [RevenueCat 상품과 권한 구성](https://www.revenuecat.com/docs/projects/configuring-products)

현재 앱에는 공통 로그인 계정이 없다. iOS와 Android 사이의 Plus 구매 공유는 제공하지 않으며, 구매 복원은 같은 플랫폼의 구매 계정으로 확인한다. 구매 복원은 습관 기록 복원이 아니다. 기록 이동은 별도 백업·복원을 사용한다.

## 공통 준비

- [ ] [App Store Connect](https://appstoreconnect.apple.com/), [Google Play Console](https://play.google.com/console/), [RevenueCat](https://app.revenuecat.com/)에 접근할 수 있다.
- [ ] 판매 가격과 국가를 정했다.
- [ ] RevenueCat에 싹 프로젝트를 만들거나 기존 프로젝트를 확인했다.
- [ ] 같은 프로젝트 안에 App Store 앱과 Google Play 앱을 각각 등록했다.
- [ ] 플랫폼 앱 식별자가 위 표의 값과 일치한다.
- [ ] `ssak_plus` Entitlement를 만들었다.
- [ ] 기본 Offering을 만들고 Lifetime 패키지를 준비했다.

플랫폼별 상품을 만든 뒤 해당 패키지에 iOS 상품과 Google 상품을 각각 연결한다. 운영용 패키지에는 실제 스토어 상품을 사용한다. RevenueCat Test Store는 개발용 테스트 환경이며 스토어 결제 검증을 대신하지 않는다. [RevenueCat 설정 순서](https://www.revenuecat.com/docs/projects/configuring-products)

## iOS 설정

### Apple 판매 계약과 상품 등록

- [ ] App Store Connect의 Business에서 Paid Apps Agreement가 **Active**인지 확인했다.
- [ ] 정산 계좌와 필요한 세금 정보를 등록했다. 샌드박스 테스트에도 활성 계약이 필요하다. [Apple 결제 준비](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/)
- [ ] 기존 싹 앱을 열어 In-App Purchases에서 상품을 추가했다.
- [ ] 유형을 **Non-Consumable 비소모성**으로 선택했다.
- [ ] 확정한 상품 ID, 참조 이름, 표시명·설명·가격·판매 국가를 입력했다.
- [ ] 심사용 스크린샷과 필수 정보를 채우고 상품 상태에 누락 항목이 없는지 확인했다.

싹 Plus는 구매할 때마다 소모되는 상품이나 구독으로 등록하지 않는다. [Apple 상품 등록](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-consumable-or-non-consumable-in-app-purchases)

### Apple과 RevenueCat 연결

- [ ] RevenueCat의 App Store 앱 설정에서 **In-App Purchase Key**를 등록했다. Apple에서 발급한 `.p8`, Key ID, Issuer ID를 해당 필드에 입력한다. [구매 검증용 키 설정](https://www.revenuecat.com/docs/service-credentials/itunesconnect-app-specific-shared-secret/in-app-purchase-key-configuration)
- [ ] 상품 자동 가져오기를 사용한다면 별도의 **App Store Connect API Key**를 연결했다. 구매 검증용 키와 상품 가져오기용 키를 구분한다. 자동 가져오기를 사용하지 않으면 상품 ID로 직접 등록한다. [Apple 서비스 키 구분](https://www.revenuecat.com/docs/store-configuration/app-store/service-credentials-index)
- [ ] Product catalog → Products에서 Apple 상품을 가져오거나 정확한 상품 ID로 추가했다.
- [ ] 상품을 `ssak_plus` Entitlement에 연결했다.
- [ ] 기본 Offering → Lifetime 패키지의 iOS 상품으로 지정했다.
- [ ] RevenueCat의 iOS 공개 SDK 키를 확보했다. 앱 환경 변수에는 이 키를 사용한다.

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
- [ ] RevenueCat의 인증 정보 검증 결과가 정상인지 확인했다.

새 인증 정보는 반영에 시간이 걸릴 수 있다. 오류가 있으면 먼저 서비스 계정 이메일, API 활성화, Play 권한, 앱 패키지를 대조한다. [서비스 계정 설정과 문제 해결](https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials)

### Google 상품과 권한 연결

- [ ] RevenueCat에 Google 상품을 가져오거나 실제 상품 ID로 추가했다.
- [ ] **RevenueCat 상품 유형을 Non-consumable로 지정했다.** 이 설정을 놓치면 구매가 소비 처리돼 재구매가 가능해질 수 있다.
- [ ] 상품을 `ssak_plus` Entitlement에 연결했다.
- [ ] 기본 Offering → Lifetime 패키지의 Android 상품으로 지정했다.
- [ ] RevenueCat의 Android 공개 SDK 키를 확보했다.

[RevenueCat Google 비소모성 상품 설정](https://www.revenuecat.com/docs/getting-started/entitlements/android-products)

### Google 환불 알림 연결

- [ ] RevenueCat의 Google Play 앱 설정에서 Pub/Sub 토픽을 선택하거나 생성하고 연결했다.
- [ ] 토픽 이름을 Play Console의 Monetization setup → Real-time developer notifications에 등록했다.
- [ ] 알림 내용에 **voided purchases와 모든 one-time products**가 포함되도록 선택했다.
- [ ] Play Console에서 테스트 알림을 전송하고 RevenueCat의 최근 수신 시각을 확인했다.

일회성 구매의 환불·취소 상태를 RevenueCat에 자동 반영하기 위한 설정이다. [Google 실시간 개발자 알림 연결](https://www.revenuecat.com/docs/platform-resources/server-notifications/google-server-notifications)

### Android 테스트 배포

- [ ] Android 공개 SDK 키를 반영한 서명 AAB를 내부 테스트 트랙에 업로드했다.
- [ ] 사용할 Google 계정을 내부 테스트 참여자로 등록했다.
- [ ] **같은 계정을 라이선스 테스터에도 등록했다.**
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

- [ ] Apple 키와 Google 키의 플랫폼을 확인했다.
- [ ] EAS 원격 빌드를 사용한다면 해당 빌드가 사용하는 환경에도 두 변수를 설정했다. 로컬의 gitignored 파일이 원격에 자동 반영된다고 가정하지 않는다.
- [ ] 환경 변수 변경 후 앱을 다시 빌드했다.
- [ ] 앱의 Plus 화면에서 스토어가 반환한 실제 가격이 보이는지 확인했다.

`.p8`와 Google 서비스 계정 JSON은 스토어와 RevenueCat 연결용 비밀 인증 정보다. 위 `EXPO_PUBLIC_` 변수나 앱 소스에 넣지 않는다. `.env.local`은 현재 저장소의 Git 제외 대상이다.

현재 코드의 연결 지점:

| 파일 | 역할 |
|---|---|
| [billing.ts](../src/renewal/billing.ts) | SDK 초기화, 기본 Lifetime 조회, 구매·복원, `ssak_plus` 권한 반영 |
| [plus.tsx](../app/plus.tsx) | 스토어 가격 표시, 구매·복원 버튼, 승인 대기 안내 |
| [proStore.ts](../src/store/proStore.ts) | 마지막으로 확인한 Plus 상태 저장 |
| [Runtime.tsx](../src/renewal/Runtime.tsx) | 앱 실행·복귀 시 구매 동기화 및 변경 수신 |
| [.env.example](../.env.example) | 필요한 환경 변수 이름 |
| [eas.json](../eas.json) | 테스트·스토어 빌드 프로필 |

상품 ID를 앱에 직접 하드코딩하는 구조가 아니다. 현재 코드는 `offerings.current.lifetime`을 읽고, 구매 이후 `customerInfo.entitlements.active.ssak_plus`로 권한을 판단한다.

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
| 판매 국가 | 미정 |
| Apple 실제 상품 ID | 미정 |
| Google 실제 상품 ID | 미정 |
| RevenueCat 프로젝트 링크 | 입력 |
| Apple 설정 완료일 | 입력 |
| Google 설정 완료일 | 입력 |
| 테스트한 앱 버전과 빌드 번호 | 입력 |
| iOS 테스트 결과와 남은 문제 | 입력 |
| Android 테스트 결과와 남은 문제 | 입력 |

스토어 업로드 전에는 기존에 사용한 iOS build number와 Android versionCode를 확인해 새 번호를 정한다. 실제 스토어 가격, 구매 복원, 환불 후 권한 반영을 검증한 뒤 결제 준비 완료로 판단한다. 전체 출시 점검은 [출시 준비 문서](launch-preparation.md)에서 이어간다.
