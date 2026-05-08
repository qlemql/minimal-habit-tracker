# 한국어 문자열 인벤토리 (Phase B1)

> v1.2 i18n 작업의 입력 자료. 본 문서의 키와 한국어 값을 그대로 `src/i18n/locales/ko.json`에 옮기고, 같은 키 구조로 `en.json`을 작성한다.
> **범위**: 사용자에게 노출되는 문자열만 (주석은 제외). `defaultReminderTime` 키워드는 매칭 로직이라 별도 처리.
> **키 네이밍 규칙**: `<screen|domain>.<section>.<element>` 도메인 계층화. 변수 보간은 `{{name}}` 형식.

---

## 0. 키 네임스페이스 맵

| 네임스페이스 | 사용처 |
|--------------|--------|
| `common.*` | 공통 텍스트 (취소, 저장, 완료, 닫기, 확인) |
| `home.*` | `app/index.tsx` |
| `settings.*` | `app/settings.tsx` |
| `onboarding.*` | `app/onboarding.tsx` |
| `add.*` | `app/add.tsx` |
| `edit.*` | `app/edit.tsx` |
| `components.habitCard.*` | `src/components/HabitCard.tsx` |
| `components.celebration.*` | `src/components/CelebrationOverlay.tsx` |
| `components.unlockToast.*` | `src/components/UnlockToast.tsx` |
| `components.weeklyCalendar.*` | `src/components/WeeklyCalendar.tsx` |
| `components.timePicker.*` | `src/components/TimePicker.tsx` |
| `components.dayDetail.*` | `src/components/DayDetailSheet.tsx` |
| `growth.stage.<id>` | `src/constants/growth.ts` |
| `rewards.tier.<flowDays>.*` | `src/constants/rewards.ts` |
| `notifications.*` | `src/utils/notifications.ts` |
| `days.short` | `src/utils/date.ts` (요일 라벨 배열) |
| `app.displayName` | 앱 표시명 (Phase F1에서 활용) |

---

## 1. common (공통)

| 키 | 한국어 |
|----|--------|
| `common.cancel` | 취소 |
| `common.save` | 저장 |
| `common.confirm` | 확인 |
| `common.close` | 닫기 |
| `common.done` | 완료 |
| `common.delete` | 삭제 |
| `common.back` | 뒤로 |

---

## 2. home — `app/index.tsx`

### 시간대 인사말 (`home.greeting.*`)
| 키 | 한국어 | 시간 조건 |
|----|--------|----------|
| `home.greeting.dawn` | 아직 새벽이에요 | hour < 5 |
| `home.greeting.morning` | 좋은 아침이에요 | hour < 9 |
| `home.greeting.lateMorning` | 오전도 화이팅 | hour < 12 |
| `home.greeting.lunch` | 점심 잘 챙겨요 | hour < 14 |
| `home.greeting.afternoon` | 오후도 힘내요 | hour < 18 |
| `home.greeting.evening` | 저녁이에요 | hour < 21 |
| `home.greeting.night` | 오늘 하루도 수고했어요 | else |

### 헤더/요약 (`home.summary.*`)
| 키 | 한국어 |
|----|--------|
| `home.summary.allCompleted` | 모두 완료! 🎉 |
| `home.summary.progress` | `{{completed}}/{{total}}` |
| `home.summary.breathing` | 쉬어가는 중이에요, 오늘 다시 이어가요 |
| `home.a11y.settings` | 설정 |

### 빈 상태 (`home.empty.*`)
| 키 | 한국어 |
|----|--------|
| `home.empty.title` | 아직 습관이 없어요 |
| `home.empty.subtitle` | 작은 시작이 큰 변화를 만들어요 |

### 추가 버튼 (`home.add.*`)
| 키 | 한국어 |
|----|--------|
| `home.add.button` | 습관 추가 |
| `home.add.limitReached` | 3개면 충분해요 |

---

## 3. settings — `app/settings.tsx`

### 헤더/제목
| 키 | 한국어 |
|----|--------|
| `settings.title` | 설정 |
| `settings.a11y.back` | 뒤로 |

### 통계 (`settings.stats.*`)
| 키 | 한국어 |
|----|--------|
| `settings.stats.habits` | 습관 |
| `settings.stats.totalDone` | 총 달성 |
| `settings.stats.unlocks` | 해금 |
| `settings.stats.nextUnlock` | 다음 해금: {{label}} |
| `settings.stats.nextUnlockDescription` | {{description}} — 흐름 {{current}}/{{target}}일 |

### 테마 섹션 (`settings.theme.*`)
| 키 | 한국어 |
|----|--------|
| `settings.theme.title` | 테마 |
| `settings.theme.cream` | 크림 |
| `settings.theme.dark` | 다크 |
| `settings.theme.system` | 시스템 |

### 알림 섹션 (`settings.notifications.*`)
| 키 | 한국어 |
|----|--------|
| `settings.notifications.title` | 알림 |
| `settings.notifications.lockScreenAction.title` | 잠금화면에서 체크 |
| `settings.notifications.lockScreenAction.subtitle` | 알림에 완료 버튼이 표시돼요 |

### 일반 섹션 (`settings.general.*`)
| 키 | 한국어 |
|----|--------|
| `settings.general.title` | 일반 |
| `settings.general.guide` | 사용 가이드 |
| `settings.general.feedback` | 피드백 보내기 |
| `settings.general.feedbackEmailSubject` | 싹 - 습관 트래커 피드백 *(F1 이후 `Ssak: Three Habits Feedback` 영문 분기)* |
| `settings.general.feedback.copiedTitle` | 이메일 복사됨 |
| `settings.general.feedback.copiedBody` | {{email}}\n클립보드에 복사되었습니다. |
| `settings.general.linkError.title` | 열 수 없음 |
| `settings.general.linkError.body` | 링크를 열 수 없습니다. |

### 법적 정보 섹션 (`settings.legal.*`)
| 키 | 한국어 |
|----|--------|
| `settings.legal.title` | 법적 정보 |
| `settings.legal.privacy` | 개인정보처리방침 |
| `settings.legal.terms` | 이용약관 |

### 버전 정보
| 키 | 한국어 |
|----|--------|
| `settings.version` | {{appName}} v{{version}} |

---

## 4. onboarding — `app/onboarding.tsx`

### 프리셋 습관 (`onboarding.preset.*`)
| 키 | 한국어 |
|----|--------|
| `onboarding.preset.water` | 물 마시기 |
| `onboarding.preset.exercise` | 운동하기 |
| `onboarding.preset.reading` | 독서하기 |
| `onboarding.preset.meditation` | 명상하기 |
| `onboarding.preset.vitamin` | 비타민 먹기 |
| `onboarding.preset.journal` | 일기 쓰기 |

### Step 1 — 인트로 (`onboarding.intro.*`)
| 키 | 한국어 |
|----|--------|
| `onboarding.intro.title` | 딱 3개만\n집중해보세요 |
| `onboarding.intro.subtitle` | 많으면 지치고, 적으면 지켜져요 |
| `onboarding.intro.cta` | 시작하기 |

### Step 2 — 선택 (`onboarding.select.*`)
| 키 | 한국어 |
|----|--------|
| `onboarding.select.title` | 어떤 습관을 만들어볼까요? |
| `onboarding.select.count` | {{count}}/3개 선택됨 |
| `onboarding.select.customPlaceholder` | 나만의 습관 입력... |
| `onboarding.select.customAdd` | 추가 |
| `onboarding.select.next` | 다음 |
| `onboarding.select.requireSelection` | 습관을 선택해주세요 |

### Step 3 — 알람 (`onboarding.reminder.*`)
| 키 | 한국어 |
|----|--------|
| `onboarding.reminder.title` | 씨앗이 자라려면\n매일 같은 시간 물을 줘야 해요 |
| `onboarding.reminder.subtitle` | 알람이 그 시간을 대신 기억해드릴게요. |
| `onboarding.reminder.editHint` | 시간을 탭하면 바꿀 수 있어요 |
| `onboarding.reminder.timeSet` | ⏰ {{time}} |
| `onboarding.reminder.timeNone` | 🔕 없음 |
| `onboarding.reminder.skip` | 건너뛰기 |
| `onboarding.reminder.ctaWithTime` | 이 시간으로 알람 켜기 |
| `onboarding.reminder.ctaNoTime` | 알람 없이 시작하기 |

### Step 4 — 가이드 (`onboarding.guide.*`)
| 키 | 한국어 |
|----|--------|
| `onboarding.guide.title` | 이렇게 사용해요 |
| `onboarding.guide.flow.title` | 꾸준할수록 자라요 |
| `onboarding.guide.flow.body` | 매일 한 탭이 단계가 되어 자라요 |
| `onboarding.guide.breathing.title` | 하루 쉬어도 괜찮아요 |
| `onboarding.guide.breathing.body` | 하루 빠져도 흐름은 이어져요.\n이틀 연속 빠지면 새로운 시작. |
| `onboarding.guide.breathing.legend` | ◌ = 쉼표 (흐름 유지) |
| `onboarding.guide.tap.title` | 탭으로 체크 |
| `onboarding.guide.tap.body` | 습관 카드를 탭하면 오늘 완료 |
| `onboarding.guide.longPress.title` | 길게 눌러 수정 |
| `onboarding.guide.longPress.body` | 이름, 아이콘, 알림을 변경할 수 있어요 |
| `onboarding.guide.swipe.title` | 스와이프로 주간 이동 |
| `onboarding.guide.swipe.body` | 지난 주 기록도 확인할 수 있어요 |
| `onboarding.guide.cta.guideOnly` | 확인 |
| `onboarding.guide.cta.start` | {{count}}개로 시작하기 |

---

## 5. add — `app/add.tsx`

| 키 | 한국어 |
|----|--------|
| `add.title` | 습관 추가 |
| `add.placeholderName` | 습관 이름 |
| `add.label.name` | 이름 |
| `add.label.icon` | 아이콘 |
| `add.label.color` | 색상 |
| `add.label.reminder` | 알림 |
| `add.input.placeholder` | 예: 물 2L 마시기 |
| `add.alert.empty.title` | 알림 |
| `add.alert.empty.body` | 습관 이름을 입력해주세요. |
| `add.alert.limit.title` | 알림 |
| `add.alert.limit.body` | 습관은 최대 3개까지만 등록할 수 있어요. |
| `add.alert.locked.title` | 잠김 |
| `add.alert.locked.body` | 흐름 {{days}}일 달성 시 해금돼요 |
| `add.a11y.cancel` | 취소 |
| `add.a11y.save` | 저장 |
| `add.a11y.lockedIcon` | 잠긴 아이콘 (흐름 {{days}}일 필요) |
| `add.a11y.lockedColor` | 잠긴 색상 (흐름 {{days}}일 필요) |
| `add.a11y.icon` | 아이콘 {{icon}} |
| `add.a11y.color` | 색상 {{color}} |

---

## 6. edit — `app/edit.tsx`

> add.* 와 다수 공유. 차이만 정리.

| 키 | 한국어 |
|----|--------|
| `edit.title` | 습관 수정 |
| `edit.delete.button` | 습관 삭제 |
| `edit.a11y.delete` | 습관 삭제 |
| `edit.delete.alert.title` | 습관 삭제 |
| `edit.delete.alert.body` | "{{name}}"을(를) 삭제하시겠어요?{{warning}} |
| `edit.delete.alert.warning` | \n{{logCount}}일간의 기록{{flowSuffix}}이 함께 삭제됩니다. |
| `edit.delete.alert.flowSuffix` | 과 흐름 {{days}}일 |
| `edit.delete.alert.cancel` | 취소 |
| `edit.delete.alert.confirm` | 삭제 |

> 그 외 `edit.placeholderName/label.*/input.placeholder/alert.empty.*/alert.locked.*/a11y.*` 는 add.*와 동일 값으로 별도 키 부여 (네임스페이스 분리 우선, DRY 후순위).

---

## 7. components

### habitCard — `src/components/HabitCard.tsx`
| 키 | 한국어 |
|----|--------|
| `components.habitCard.a11y.label` | {{name}} {{state}}{{stagePart}}{{flowPart}} |
| `components.habitCard.a11y.completed` | 완료됨 |
| `components.habitCard.a11y.incomplete` | 미완료 |
| `components.habitCard.a11y.stage` | {{label}} 단계 |
| `components.habitCard.a11y.flow` | 흐름 {{days}}일째 |
| `components.habitCard.a11y.hint` | 탭하여 체크, 길게 눌러 수정 |
| `components.habitCard.flow` | 흐름 {{days}}일째 |
| `components.habitCard.flowBreathing` | ◌ 흐름 {{days}}일째 |

### celebration — `src/components/CelebrationOverlay.tsx`
| 키 | 한국어 |
|----|--------|
| `components.celebration.message.0` | 오늘도 잘 자랐어요 |
| `components.celebration.message.1` | 꾸준함이 자라요 |
| `components.celebration.message.2` | 흐름이 이어졌어요 |
| `components.celebration.message.3` | 물 한 모금 줬어요 |
| `components.celebration.daysToNext` | 다음 성장까지 {{days}}일 {{emoji}} |

### unlockToast — `src/components/UnlockToast.tsx`
| 키 | 한국어 |
|----|--------|
| `components.unlockToast.grew` | {{label}}으로 자랐어요 |

### weeklyCalendar — `src/components/WeeklyCalendar.tsx`
| 키 | 한국어 |
|----|--------|
| `components.weeklyCalendar.thisWeek` | 이번 주 |
| `components.weeklyCalendar.rangeSameMonth` | {{firstMonth}}월 {{firstDay}}일 ~ {{lastDay}}일 |
| `components.weeklyCalendar.rangeCrossMonth` | {{firstMonth}}월 {{firstDay}}일 ~ {{lastMonth}}월 {{lastDay}}일 |
| `components.weeklyCalendar.a11y.prevWeek` | 이전 주 |
| `components.weeklyCalendar.a11y.nextWeek` | 다음 주 |
| `components.weeklyCalendar.a11y.day` | {{dayLabel}}요일 {{dayNum}}일{{allDoneSuffix}} |
| `components.weeklyCalendar.a11y.allDone` |  모두 완료 |

### timePicker — `src/components/TimePicker.tsx`
| 키 | 한국어 |
|----|--------|
| `components.timePicker.daily` | 매일 {{time}} |
| `components.timePicker.none` | 알림 없음 |
| `components.timePicker.modalTitle` | 알림 시간 |
| `components.timePicker.cancel` | 취소 |
| `components.timePicker.done` | 완료 |
| `components.timePicker.clear` | 알림 끄기 |
| `components.timePicker.hour` | {{hour}}시 |
| `components.timePicker.minute` | {{minute}}분 |
| `components.timePicker.a11y.set` | 알림 시간 {{time}} |
| `components.timePicker.a11y.unset` | 알림 설정 |

### dayDetail — `src/components/DayDetailSheet.tsx`
| 키 | 한국어 |
|----|--------|
| `components.dayDetail.title` | {{dayLabel}}요일 {{dayNum}}일 |
| `components.dayDetail.pastNotice` | 지난 기록이에요 |
| `components.dayDetail.close` | 닫기 |

---

## 8. growth — `src/constants/growth.ts`

| 키 | 한국어 | 영문 (참고) |
|----|--------|------------|
| `growth.stage.seed` | 씨앗 | Seed |
| `growth.stage.sprout` | 발아 | Sprout |
| `growth.stage.leaf` | 떡잎 | Leaf |
| `growth.stage.stem` | 줄기 | Stem |
| `growth.stage.bud` | 꽃봉오리 | Bud |
| `growth.stage.bloom` | 개화 | Bloom |

> 키 구조는 `STAGES[i].id`와 일치 → 코드에서 `t(\`growth.stage.${stage.id}\`)` 사용 가능.

---

## 9. rewards — `src/constants/rewards.ts`

| 키 | 한국어 |
|----|--------|
| `rewards.tier.7.label` | 7일 흐름 |
| `rewards.tier.7.description` | 새로운 색상 2개 해금 |
| `rewards.tier.14.label` | 14일 흐름 |
| `rewards.tier.14.description` | 새로운 아이콘 4개 해금 |
| `rewards.tier.30.label` | 30일 흐름 |
| `rewards.tier.30.description` | 프리미엄 색상 3개 해금 |
| `rewards.tier.50.label` | 50일 흐름 |
| `rewards.tier.50.description` | 프리미엄 아이콘 4개 해금 |

---

## 10. notifications — `src/utils/notifications.ts`

| 키 | 한국어 |
|----|--------|
| `notifications.actionDone` | 완료 |
| `notifications.title` | 습관 리마인더 |
| `notifications.body` | {{habitName}} 할 시간이에요! |

> ⚠️ `notifications.actionDone`은 iOS 카테고리 등록 시점에 OS에 캐시. 디바이스 언어 변경 시 재등록 필요. Phase D3에서 처리.

---

## 11. days — `src/utils/date.ts`

| 키 | 한국어 |
|----|--------|
| `days.short` (배열 또는 7개 분리) | 월, 화, 수, 목, 금, 토, 일 |

> 배열 키는 i18next에서 `returnObjects: true` 또는 키 7개 분리 (`days.short.0~6`) 두 방법 중 후자 권장 (타입 안정성).

---

## 12. app — 표시명 (Phase F1에서 활용)

| 키 | 한국어 | 영어 |
|----|--------|------|
| `app.displayName` | 싹: 세 가지 습관 | Ssak: Three Habits |

> 실제 홈 화면 표시명은 i18next가 아니라 iOS `InfoPlist.strings` / Android `strings.xml`에서 분기. 본 키는 앱 내부 표시(설정 화면 버전 라벨 등)용.

---

## 13. i18n 대상 외 (별도 처리)

### `src/utils/defaultReminderTime.ts`
한국어 키워드(`물`, `운동`, `독서` 등)로 디폴트 알림 시간을 매칭. 영어 디바이스에서는 영어 키워드 매칭이 필요.

**처리 방안 (Phase B5에서 결정)**:
- 디바이스 로케일에 따라 키워드 테이블 분기 (`KEYWORD_TIMES_KO` / `KEYWORD_TIMES_EN`)
- 영어 키워드: water, drink / exercise, run, jog, walk / stretch / read, book / meditate, yoga / vitamin, supplement, pill / journal / study, learn

### `app/_layout.tsx` 등 코멘트
i18n 대상 아님.

### 기존 `싹 - 습관 트래커` 표기
`settings.tsx:263` 버전 라벨 `싹 - 습관 트래커 v1.0.0` → Phase F1 후 `{{appName}} v{{version}}` 키로 분리하여 `app.displayName` 참조.

---

## 14. 통계

- 총 사용자 노출 키: **약 145개**
- 화면별 분포: home(13), settings(20), onboarding(34), add(15), edit(14), components(28), domain(growth+rewards+days+notifications, 약 21)
- 인터폴레이션 변수: name, count, days, time, dayLabel, dayNum, label, description, current, target, hour, minute, email, version, appName, icon, color, completed, total, habitName, firstMonth, firstDay, lastMonth, lastDay, emoji, warning, logCount, flowSuffix, stagePart, flowPart, state, allDoneSuffix
