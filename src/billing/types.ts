/** Store-local product ID and price; never a provider SDK object or persisted purchase proof. */
export interface LifetimeProduct {
  readonly id: string;
  readonly displayPrice: string;
}

export interface BillingAccess {
  readonly isPlus: boolean;
}

export type BillingErrorCode = 'cancelled' | 'pending' | 'unavailable' | 'invalid-product' | 'failed';

export class BillingError extends Error {
  constructor(readonly code: BillingErrorCode) {
    super(`billing-${code}`);
    this.name = 'BillingError';
  }
}

/** Implementations validate purchases, normalize errors and never write app state directly. */
export interface BillingProvider {
  isAvailable(): boolean;
  getLifetimeProduct(): Promise<LifetimeProduct | null>;
  // Purchase the product returned by this provider; reload products after restarting the app.
  purchase(product: LifetimeProduct): Promise<BillingAccess>;
  restore(): Promise<BillingAccess>;
  getAccess(): Promise<BillingAccess>;
  subscribe(listener: (access: BillingAccess) => void): Promise<() => void>;
}
