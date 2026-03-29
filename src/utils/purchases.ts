import { useProStore } from '@/store/proStore';

// RevenueCat 연동은 expo prebuild 후 네이티브 빌드에서 활성화
// 현재는 Pro 상태를 로컬 스토어로 관리 (개발/테스트용)
// TODO: prebuild 후 react-native-purchases 설치 및 실제 연동

export async function initializePurchases(): Promise<void> {
  // RevenueCat SDK 초기화 — prebuild 후 구현
}

export async function checkProStatus(): Promise<boolean> {
  return useProStore.getState().isPro;
}

export async function purchasePro(): Promise<boolean> {
  // 실제 구매 로직 — prebuild 후 구현
  // 개발 중에는 수동 Pro 토글로 테스트
  return false;
}

export async function restorePurchases(): Promise<boolean> {
  // 구매 복원 — prebuild 후 구현
  return false;
}
