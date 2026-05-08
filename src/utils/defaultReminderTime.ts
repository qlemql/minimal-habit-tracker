/**
 * 습관 이름에서 키워드를 찾아 기본 알림 시간을 반환.
 * 매칭 실패 시 범용 디폴트(21:00) 반환.
 * 15분 단위(00/15/30/45)로만 반환 — TimePicker UI와 정렬.
 */

interface Rule {
  keywords: readonly string[];
  time: string; // HH:mm
}

const RULES: readonly Rule[] = [
  { keywords: ['물', '수분', '마시기', 'water', 'drink', 'hydrat'], time: '15:00' },
  { keywords: ['운동', '헬스', '러닝', '조깅', '산책', '걷기', 'exercise', 'workout', 'run', 'jog', 'walk', 'gym'], time: '19:00' },
  { keywords: ['스트레칭', 'stretch'], time: '07:00' },
  { keywords: ['독서', '책', 'read', 'book'], time: '22:00' },
  { keywords: ['명상', '요가', 'meditat', 'yoga'], time: '07:00' },
  { keywords: ['비타민', '영양제', '약', 'vitamin', 'supplement', 'pill', 'med'], time: '09:00' },
  { keywords: ['일기', '저널', '회고', 'journal', 'diary'], time: '22:30' },
  { keywords: ['공부', '학습', 'study', 'learn'], time: '20:00' },
] as const;

const FALLBACK_TIME = '21:00';

export function getDefaultReminderTime(habitName: string): string {
  const normalized = habitName.trim().toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => normalized.includes(k))) {
      return rule.time;
    }
  }
  return FALLBACK_TIME;
}
