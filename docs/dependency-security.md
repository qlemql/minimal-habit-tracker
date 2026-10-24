# 의존성 보안 검토 — 2026-10-04

## 2026-10-25 보안 수정 — 아래 과거 기록보다 우선

- Vitest / @vitest/mocker 4.1.12, Vite 8.3.5, source-map-js 1.2.2, undici 6.29.1로 패치 업데이트했다. Expo SDK의 메이저 버전은 변경하지 않았다.
- `node-forge`는 registry 최신 버전도 1.4.0이며 공식 수정 릴리스가 없다. [공개 수정안 #1152](https://github.com/digitalbazaar/forge/pull/1152)을 참고해 중첩 DigestAlgorithm 안의 미소비 요소를 거부하는 최소 변경을 `patches/node-forge+1.4.0.patch`로 적용했다. 상위 프로젝트에 아직 병합되지 않은 수정안의 로컬 백포트임을 구분한다.
- `scripts/check-forge-security.cjs`에서 정상 SHA-256/384/512 서명, 다른 해시, NULL 생략/포함 정상 인코딩, 중첩 garbage 인코딩 거부를 확인한다. `postinstall`에서 patch-package 적용 직후 이 검사를 실행하며 실패하면 설치도 실패한다. 버전 번호를 위조하거나 audit 경고를 숨기지 않았다.
- `npm ci` 재설치와 3개 패치 자동 적용·서명 검사를 통과했다. `npm audit`는 9개(상 7·중 2)에서 4개(상 4)로 줄었다. 남은 항목은 node-forge 1.4.0과 이를 사용하는 expo / @expo/cli / @expo/code-signing-certificates의 버전 기반 경고다. 취약 코드 패치는 적용했지만 공식 수정 버전이 나올 때까지 audit 경고 자체는 남는다.
- 패치 전후 audit 원본은 `artifacts/security/audit-2026-10-25.json`, `audit-fixed-2026-10-25.json`이다. 기존 테스트에 회귀 검사를 더해 16개 파일·109개 테스트 통과, 타입 검사·웹 export·iOS/Android Hermes JavaScript export 통과. 실제 서명 IPA/AAB 생성·기기 설치·스토어 재제출은 이번 수정에서 하지 않았다.
- node-forge가 정식 수정 버전을 배포하면 패치 제거와 의존성 업데이트를 함께 수행하고 서명 검사를 유지한다. `npm audit fix --force`가 제안하는 Expo 44 역행은 적용하지 않는다.

## 적용한 수정

| 경로 | 변경 | 호환성 확인 |
|---|---|---|
| Expo Router → query-string → decode-uri-component | 0.2.2 → 0.5.0 | 한글·일본어·이모지·공백·예약문자, 긴 잘못된 인코딩 입력 |
| Metro → image-size | 1.2.1 → 2.0.4 | 실제 앱 아이콘을 Metro의 파일 경로 API로 읽고 웹/네이티브 export |
| Xcode 플러그인 → uuid | 7/8 → 11.1.1 | Xcode 프로젝트에서 사용하는 v4 기반 24자리 ID 생성 |

수정 버전의 ESM export와 이미지 파일 API가 기존 호출 방식과 달랐다.
`patches/query-string+7.1.3.patch`는 decoder의 default export를 사용하고,
`patches/metro+0.83.3.patch`는 이미지 파일을 Buffer로 읽어 새 parser에 전달한다.
보안 알고리즘을 자체 작성한 패치는 아니다. `postinstall`에서 적용하며 실패하면 설치도 실패한다.
상위 Router/Metro가 새 API를 지원하게 되면 override와 해당 패치를 함께 제거한다.

최초 교체 후 웹 빌드에서 image-size에 파일 경로 문자열을 전달하는 호환성 오류를 확인했다.
Metro 패치 후 실제 파일 경로 API 통합 테스트와 웹 export가 통과했다.

[URL 디코더 보안 공지](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr),
[이미지 파서 보안 공지](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq),
[UUID 보안 공지](https://github.com/advisories/GHSA-w5hq-g745-h8pq).

## 남은 경고

`npm audit` 기준 36개(상 22, 중 14)에서 **23개(상 23, 중 0)**로 변경됐다.
23개는 아래 두 취약 패키지를 사용하는 전이 의존 경로를 포함한다. 패치 재현 도구도
braces를 사용해 경로 하나가 추가됐으므로 등급별 수치만으로 개선 정도를 판단하지 않는다.
치명적 0개. 원본 결과는 `artifacts/security/audit-before.json`과 `audit-after.json`에 보관한다.

| 원인 | 현재 사용 | 남은 위험 및 대응 |
|---|---|---|
| braces 3.0.3, 중첩 패턴에 의한 스택 고갈 | Metro/테스트/패치 도구의 파일 패턴 처리 | 비정상 glob을 가진 외부 프로젝트나 설정을 실행하지 않는다. 개발 서버는 외부 공개하지 않는다. 현재 registry에 수정 버전 없음 |
| node-forge 1.4.0, RSA 서명 검증 문제 | Expo CLI의 인증서·코드서명 도구 | 이 앱은 expo-updates/OTA 서명을 사용하지 않는다. 임의 인증서·키를 CLI 입력으로 받아 처리하지 않는다. 현재 registry에 수정 버전 없음 |

[braces 공지](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
[node-forge 공지](https://github.com/advisories/GHSA-86w9-cpqp-85rv).

현재 판단은 남은 두 패키지가 빌드 도구 경로라는 정적 의존성 분석에 근거한다.
배포 번들의 소스맵도 확인했다. iOS 1,710개 / Android 1,709개 source 항목 중
braces와 node-forge는 없고 수정된 decode-uri-component는 포함돼 있었다.
증거: `artifacts/security/native-runtime-sources.json`.
경고가 사라진 것은 아니며,
빌드 도구를 외부 서비스로 노출하거나 OTA 업데이트를 추가하면 이 검토를 다시 해야 한다.
`npm audit fix --force`가 제시한 Expo 44/구형 patch-package로의 역행은 적용하지 않았다.

## 재검증 방법

1. `npm ci`: 같은 lockfile과 두 패치로 설치되는지 확인.
2. `npm run test:run`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
3. `npx expo export --platform ios --platform android --source-maps --output-dir dist-native`.
4. `npm audit --json`으로 새로운 취약 원인이 생겼는지 확인하고 실제 native 빌드에서도 검증.

클라우드 빌드의 Node 버전은 22.14.0으로 고정했다. 서명된 설치 파일 검증은 EAS 인증 또는
로컬 네이티브 환경이 준비된 후 별도 수행해야 한다.

`npm ci`로 의존성을 새로 설치한 뒤 두 패치 자동 적용, 단위/통합 50개,
웹 유저플로우 27개, 웹 및 iOS/Android JS export를 재검증했다.
