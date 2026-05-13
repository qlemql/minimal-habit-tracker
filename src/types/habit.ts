import type { GrowthStageId } from '@/constants/growth';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  reminderTime: string | null; // HH:mm 형식
  order: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601

  // 졸업 시스템 (v1.3+)
  // isGraduated=true 인 항목은 활성 슬롯 카운트에서 제외되고 메인 리스트에 노출되지 않음.
  // 통계 화면의 "졸업한 정원" 섹션에만 표시됨.
  graduatedAt?: string;            // YYYY-MM-DD
  graduatedStage?: GrowthStageId;  // 졸업 시 단계 (leaf/stem/bud/bloom)
  totalFlowDays?: number;          // 졸업 시점 누적 흐름 일수
  isGraduated?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt: string | null; // ISO 8601
}
