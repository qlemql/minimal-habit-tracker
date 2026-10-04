import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProStore } from '../src/store/proStore';
import {
  billingAvailable,
  syncPurchase,
  getLifetimePackage,
  buyLifetime,
  restoreLifetime,
  PurchasePendingError,
  listenToPurchaseUpdates,
} from '../src/renewal/billing';
import type { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
const mocks = vi.hoisted(() => ({
  isConfigured: vi.fn(async () => true),
  configure: vi.fn(),
  getCustomerInfo: vi.fn(),
  getOfferings: vi.fn(),
  purchasePackage: vi.fn(),
  restorePurchases: vi.fn(),
  PACKAGE_TYPE: { LIFETIME: 'LIFETIME' },
  PURCHASES_ERROR_CODE: { PAYMENT_PENDING_ERROR: '20' },
  addCustomerInfoUpdateListener: vi.fn((_listener: (info: CustomerInfo) => void) => {}),
  removeCustomerInfoUpdateListener: vi.fn(),
}));
vi.mock('react-native-purchases', () => ({ default: mocks }));
const entitlement = (active: boolean) => ({
  entitlements: { active: active ? { ssak_plus: { identifier: 'ssak_plus' } } : {} },
});
const lifetime = { packageType: 'LIFETIME' } as PurchasesPackage;
beforeEach(() => {
  vi.stubEnv('EXPO_PUBLIC_REVENUECAT_IOS_KEY', 'test-public-key');
  useProStore.setState({ isPro: false });
});
describe('verified lifetime entitlement', () => {
  it('pending approval never grants access or appears as a completed purchase', async () => {
    mocks.purchasePackage.mockRejectedValueOnce({ code: '20', userCancelled: false });
    await expect(buyLifetime(lifetime)).rejects.toBeInstanceOf(PurchasePendingError);
    expect(useProStore.getState().isPro).toBe(false);
  });
  it('customer updates apply later approval/refund and the listener can be removed', async () => {
    const stop = await listenToPurchaseUpdates();
    const listener = mocks.addCustomerInfoUpdateListener.mock.calls[0][0];
    listener(entitlement(true) as CustomerInfo);
    expect(useProStore.getState().isPro).toBe(true);
    listener(entitlement(false) as CustomerInfo);
    expect(useProStore.getState().isPro).toBe(false);
    stop();
    expect(mocks.removeCustomerInfoUpdateListener).toHaveBeenCalledWith(listener);
  });
  it('does not fabricate products or entitlement when unconfigured', async () => {
    vi.stubEnv('EXPO_PUBLIC_REVENUECAT_IOS_KEY', '');
    expect(billingAvailable()).toBe(false);
    expect(await getLifetimePackage()).toBeNull();
    await syncPurchase();
    expect(useProStore.getState().isPro).toBe(false);
  });
  it('grants only the matching entitlement returned by the SDK', async () => {
    mocks.purchasePackage.mockResolvedValueOnce({ customerInfo: entitlement(true) });
    expect(await buyLifetime(lifetime)).toBe(true);
    expect(useProStore.getState().isPro).toBe(true);
  });
  it('a successful transaction without entitlement does not unlock', async () => {
    mocks.purchasePackage.mockResolvedValueOnce({ customerInfo: entitlement(false) });
    expect(await buyLifetime(lifetime)).toBe(false);
    expect(useProStore.getState().isPro).toBe(false);
  });
  it('cancelled transactions leave the free state intact', async () => {
    mocks.purchasePackage.mockRejectedValueOnce({ userCancelled: true });
    await expect(buyLifetime(lifetime)).rejects.toMatchObject({ userCancelled: true });
    expect(useProStore.getState().isPro).toBe(false);
  });
  it('rejects subscription packages', async () => {
    await expect(buyLifetime({ packageType: 'MONTHLY' } as PurchasesPackage)).rejects.toThrow(
      'not-lifetime',
    );
    expect(mocks.purchasePackage).not.toHaveBeenCalled();
  });
  it('restores purchases and revokes a refunded entitlement', async () => {
    mocks.restorePurchases.mockResolvedValueOnce(entitlement(true));
    expect(await restoreLifetime()).toBe(true);
    mocks.getCustomerInfo.mockResolvedValueOnce(entitlement(false));
    await syncPurchase();
    expect(useProStore.getState().isPro).toBe(false);
  });
  it('retains previously verified access during network failure', async () => {
    useProStore.setState({ isPro: true });
    mocks.getCustomerInfo.mockRejectedValueOnce(new Error('offline'));
    await expect(syncPurchase()).rejects.toThrow('offline');
    expect(useProStore.getState().isPro).toBe(true);
  });
});
