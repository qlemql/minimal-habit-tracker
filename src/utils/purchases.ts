// Compatibility entry point; purchase state is updated through the shared billing service.
import { useProStore } from '@/store/proStore';
import { syncPurchase, getLifetimeProduct, buyLifetime, restoreLifetime } from '@/renewal/billing';
export const initializePurchases = syncPurchase;
export const checkProStatus = async (): Promise<boolean> => {
  await syncPurchase();
  return useProStore.getState().isPro;
};
export const purchasePro = async (): Promise<boolean> => {
  const item = await getLifetimeProduct();
  return item ? buyLifetime(item) : false;
};
export const restorePurchases = restoreLifetime;
