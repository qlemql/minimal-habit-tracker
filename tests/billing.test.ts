import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Platform } from 'react-native';
import { useProStore } from '../src/store/proStore';
import {
  billingAvailable, syncPurchase, getLifetimeProduct, buyLifetime, restoreLifetime,
  BillingError, listenToPurchaseUpdates,
} from '../src/renewal/billing';
import { createRevenueCatProvider } from '../src/billing/revenueCat';
import type { CustomerInfo } from 'react-native-purchases';

const mocks = vi.hoisted(() => ({
  isConfigured: vi.fn(), configure: vi.fn(), getCustomerInfo: vi.fn(),
  getOfferings: vi.fn(), purchasePackage: vi.fn(), restorePurchases: vi.fn(),
  PACKAGE_TYPE: { LIFETIME: 'LIFETIME' },
  PRODUCT_CATEGORY: { NON_SUBSCRIPTION: 'NON_SUBSCRIPTION' },
  PURCHASES_ERROR_CODE: { PAYMENT_PENDING_ERROR: '20', PURCHASE_CANCELLED_ERROR: '1' },
  addCustomerInfoUpdateListener: vi.fn((_listener: (info: CustomerInfo) => void) => {}),
  removeCustomerInfoUpdateListener: vi.fn(),
}));
vi.mock('react-native-purchases', () => ({ default: mocks }));
const entitlement = (active: boolean) => ({
  entitlements: { active: active ? { ssak_plus: { identifier: 'ssak_plus' } } : {} },
});
const lifetime = {
  identifier: '$rc_lifetime', packageType: 'LIFETIME',
  product: {
    identifier: 'ssak_plus_lifetime', priceString: '₩9,900',
    productCategory: 'NON_SUBSCRIPTION', subscriptionPeriod: null,
  },
};
const loadProduct = async () => {
  const product = await getLifetimeProduct();
  expect(product).not.toBeNull();
  return product!;
};
beforeEach(() => {
  vi.resetAllMocks();
  Platform.OS = 'ios';
  vi.stubEnv('EXPO_PUBLIC_REVENUECAT_IOS_KEY', 'appl_test-public-key');
  vi.stubEnv('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY', 'goog_test-public-key');
  mocks.isConfigured.mockResolvedValue(true);
  mocks.getOfferings.mockResolvedValue({ current: { lifetime } });
  useProStore.setState({ isPro: false });
});

describe('RevenueCat billing integration', () => {
  it('exposes only a store product ID and localized price, purchasing the original offering package', async () => {
    const product = await loadProduct();
    expect(product).toEqual({ id: 'ssak_plus_lifetime', displayPrice: '₩9,900' });
    mocks.purchasePackage.mockResolvedValueOnce({ customerInfo: entitlement(true) });
    expect(await buyLifetime(product)).toBe(true);
    expect(mocks.purchasePackage).toHaveBeenCalledWith(lifetime);
    expect(useProStore.getState().isPro).toBe(true);
  });
  it('pending approval never grants access', async () => {
    mocks.purchasePackage.mockRejectedValueOnce({ code: '20', userCancelled: false });
    await expect(buyLifetime(await loadProduct())).rejects.toMatchObject({ code: 'pending' });
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
  it.each(['ios', 'android', 'web'] as const)('does not fabricate products or touch the SDK when unavailable (%s)', async (platform) => {
    Platform.OS = platform;
    if (platform !== 'web') {
      vi.stubEnv(platform === 'ios' ? 'EXPO_PUBLIC_REVENUECAT_IOS_KEY' : 'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY', '');
    }
    expect(billingAvailable()).toBe(false);
    expect(await getLifetimeProduct()).toBeNull();
    await syncPurchase();
    const stop = await listenToPurchaseUpdates();
    stop();
    await expect(restoreLifetime()).rejects.toMatchObject({ code: 'unavailable' });
    expect(mocks.isConfigured).not.toHaveBeenCalled();
    expect(useProStore.getState().isPro).toBe(false);
  });
  it('a successful transaction with another entitlement does not unlock Plus', async () => {
    mocks.purchasePackage.mockResolvedValueOnce({
      customerInfo: { entitlements: { active: { another_product: {} } } },
    });
    expect(await buyLifetime(await loadProduct())).toBe(false);
    expect(useProStore.getState().isPro).toBe(false);
  });
  it.each([{ code: '1' }, { userCancelled: true }])('normalizes cancellation without granting access (%j)', async (error) => {
    mocks.purchasePackage.mockRejectedValueOnce(error);
    await expect(buyLifetime(await loadProduct())).rejects.toMatchObject({ code: 'cancelled' });
    expect(useProStore.getState().isPro).toBe(false);
  });
  it.each([
    { ...lifetime, packageType: 'MONTHLY' },
    { ...lifetime, product: { ...lifetime.product, productCategory: 'SUBSCRIPTION' } },
    { ...lifetime, product: { ...lifetime.product, subscriptionPeriod: 'P1M' } },
  ])('rejects subscriptions even if assigned to the Lifetime slot', async (item) => {
    mocks.getOfferings.mockResolvedValueOnce({ current: { lifetime: item } });
    await expect(getLifetimeProduct()).rejects.toMatchObject({ code: 'invalid-product' });
    expect(mocks.purchasePackage).not.toHaveBeenCalled();
  });
  it('does not purchase an arbitrary product supplied by the caller', async () => {
    await expect(buyLifetime({ id: 'other_product', displayPrice: '₩1' }))
      .rejects.toMatchObject({ code: 'invalid-product' });
    expect(mocks.purchasePackage).not.toHaveBeenCalled();
  });
  it('returns no product when the current offering is absent', async () => {
    mocks.getOfferings.mockResolvedValueOnce({ current: null });
    expect(await getLifetimeProduct()).toBeNull();
    expect(useProStore.getState().isPro).toBe(false);
  });
  it('restores purchases and revokes a refunded entitlement', async () => {
    mocks.restorePurchases.mockResolvedValueOnce(entitlement(true));
    expect(await restoreLifetime()).toBe(true);
    mocks.getCustomerInfo.mockResolvedValueOnce(entitlement(false));
    await syncPurchase();
    expect(useProStore.getState().isPro).toBe(false);
  });
  it('retains previously verified access during network failure without leaking SDK errors', async () => {
    useProStore.setState({ isPro: true });
    mocks.getCustomerInfo.mockRejectedValueOnce({ code: '10', message: 'SDK internal details' });
    await expect(syncPurchase()).rejects.toEqual(new BillingError('failed'));
    expect(useProStore.getState().isPro).toBe(true);
  });
  it.each(['ios', 'android'] as const)('configures once for concurrent initial requests using the %s key', async (platform) => {
    Platform.OS = platform;
    mocks.isConfigured.mockResolvedValue(false);
    mocks.getCustomerInfo.mockResolvedValue(entitlement(false));
    const provider = createRevenueCatProvider();
    const [, , stop] = await Promise.all([
      provider.getAccess(), provider.getLifetimeProduct(), provider.subscribe(() => {}),
    ]);
    expect(mocks.configure).toHaveBeenCalledExactlyOnceWith({
      apiKey: platform === 'ios' ? 'appl_test-public-key' : 'goog_test-public-key',
    });
    stop();
  });
  it('retries SDK initialization after a failure', async () => {
    const provider = createRevenueCatProvider();
    mocks.isConfigured.mockRejectedValueOnce(new Error('native initialization failed'));
    await expect(provider.getLifetimeProduct()).rejects.toMatchObject({ code: 'failed' });
    expect(await provider.getLifetimeProduct()).toEqual({ id: 'ssak_plus_lifetime', displayPrice: '₩9,900' });
  });
});
