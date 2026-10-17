import { BillingError, type BillingAccess, type BillingProvider, type LifetimeProduct } from './types';

/** Owns app access updates independently of the store SDK and the persisted state implementation. */
export const createBillingService = (
  provider: BillingProvider,
  updateAccess: (access: BillingAccess) => void,
) => {
  let accessRevision = 0;
  let latestRefresh = 0;
  const apply = (access: BillingAccess): boolean => {
    accessRevision += 1;
    updateAccess(access);
    return access.isPlus;
  };
  const requireAvailable = () => {
    if (!provider.isAvailable()) throw new BillingError('unavailable');
  };

  return {
    billingAvailable: () => provider.isAvailable(),
    getLifetimeProduct: async (): Promise<LifetimeProduct | null> =>
      provider.isAvailable() ? provider.getLifetimeProduct() : null,
    syncPurchase: async (): Promise<void> => {
      if (!provider.isAvailable()) return;
      const revision = accessRevision;
      const request = ++latestRefresh;
      const access = await provider.getAccess();
      // A slow foreground refresh must not overwrite a purchase/refund received while it waited.
      if (revision === accessRevision && request === latestRefresh) apply(access);
    },
    listenToPurchaseUpdates: async (): Promise<() => void> => {
      if (!provider.isAvailable()) return () => {};
      let stopped = false;
      const unsubscribe = await provider.subscribe((access) => {
        if (!stopped) apply(access);
      });
      return () => {
        if (stopped) return;
        stopped = true;
        unsubscribe();
      };
    },
    buyLifetime: async (product: LifetimeProduct): Promise<boolean> => {
      requireAvailable();
      return apply(await provider.purchase(product));
    },
    restoreLifetime: async (): Promise<boolean> => {
      requireAvailable();
      return apply(await provider.restore());
    },
  };
};
