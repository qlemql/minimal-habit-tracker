import { useProStore } from '@/store/proStore';
import { createBillingService } from '@/billing/service';
import { createRevenueCatProvider } from '@/billing/revenueCat';

export { BillingError } from '@/billing/types';
export type { LifetimeProduct } from '@/billing/types';

// The only provider selection point. Screens/runtime do not depend on RevenueCat.
export const {
  billingAvailable,
  getLifetimeProduct,
  syncPurchase,
  listenToPurchaseUpdates,
  buyLifetime,
  restoreLifetime,
} = createBillingService(createRevenueCatProvider(), ({ isPlus }) => {
  useProStore.getState().setPro(isPlus);
});
