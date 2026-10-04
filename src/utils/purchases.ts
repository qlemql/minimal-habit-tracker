// Compatibility entry point; purchase state is only changed by the billing adapter.
import { useProStore } from '@/store/proStore';
import { syncPurchase, getLifetimePackage, buyLifetime, restoreLifetime } from '@/renewal/billing';
export const initializePurchases = syncPurchase;
export const checkProStatus = async (): Promise<boolean> => {
  await syncPurchase();
  return useProStore.getState().isPro;
};
export const purchasePro = async (): Promise<boolean> => {
  const item = await getLifetimePackage();
  return item ? buyLifetime(item) : false;
};
export const restorePurchases = restoreLifetime;
