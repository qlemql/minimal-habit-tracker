// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
export function getToday(): string {
  return formatDate(new Date());
}

// Date 객체를 YYYY-MM-DD 형식으로 변환
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 이번 주 날짜 배열 반환 (월~일)
export function getWeekDates(baseDate: Date = new Date()): string[] {
  const dates: string[] = [];
  const day = baseDate.getDay();
  // 월요일 기준 (일요일=0 → offset=6, 월요일=1 → offset=0)
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + mondayOffset);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

// 요일 라벨 (월~일)
export const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;
