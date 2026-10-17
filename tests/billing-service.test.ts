import { describe, expect, it, vi } from 'vitest';
import { createBillingService } from '../src/billing/service';
import { BillingError, type BillingAccess, type BillingProvider } from '../src/billing/types';

// No RevenueCat import: the same app service works with a replacement backend provider.
const setup = () => {
  let access = { isPlus: false };
  let listener: (access: BillingAccess) => void = () => {};
  const stop = vi.fn();
  const provider = {
    isAvailable: vi.fn(() => true),
    getLifetimeProduct: vi.fn(async () => ({ id: 'store_lifetime', displayPrice: '$4.99' })),
    purchase: vi.fn(async () => ({ isPlus: true })),
    restore: vi.fn(async () => ({ isPlus: true })),
    getAccess: vi.fn(async () => ({ isPlus: false })),
    subscribe: vi.fn(async (onAccess: (access: BillingAccess) => void) => {
      listener = onAccess;
      return stop;
    }),
  } satisfies BillingProvider;
  const service = createBillingService(provider, (next) => { access = next; });
  return { service, provider, stop, access: () => access, emit: (next: BillingAccess) => listener(next) };
};

describe('provider-independent purchase lifecycle', () => {
  it('supports product, purchase, restore and revoked access from a replacement provider', async () => {
    const { service, provider, access } = setup();
    const product = await service.getLifetimeProduct();
    expect(await service.buyLifetime(product!)).toBe(true);
    expect(provider.purchase).toHaveBeenCalledWith(product);
    expect(access().isPlus).toBe(true);
    await service.syncPurchase();
    expect(access().isPlus).toBe(false);
    expect(await service.restoreLifetime()).toBe(true);
    expect(access().isPlus).toBe(true);
  });
  it.each(['pending', 'cancelled', 'failed'] as const)('does not grant access on %s', async (code) => {
    const { service, provider, access } = setup();
    provider.purchase.mockRejectedValueOnce(new BillingError(code));
    await expect(service.buyLifetime((await service.getLifetimeProduct())!)).rejects.toMatchObject({ code });
    expect(access().isPlus).toBe(false);
  });
  it('keeps verified access when a restore or refresh fails', async () => {
    const { service, provider, access } = setup();
    await service.restoreLifetime();
    provider.restore.mockRejectedValueOnce(new BillingError('failed'));
    provider.getAccess.mockRejectedValueOnce(new BillingError('failed'));
    await expect(service.restoreLifetime()).rejects.toThrow();
    await expect(service.syncPurchase()).rejects.toThrow();
    expect(access().isPlus).toBe(true);
  });
  it('does not erase cached access when billing is unavailable', async () => {
    const { service, provider, access } = setup();
    await service.restoreLifetime();
    provider.isAvailable.mockReturnValue(false);
    await service.syncPurchase();
    expect(access().isPlus).toBe(true);
    expect(provider.getAccess).not.toHaveBeenCalled();
    await expect(service.buyLifetime({ id: 'store_lifetime', displayPrice: '$4.99' }))
      .rejects.toMatchObject({ code: 'unavailable' });
    expect(provider.purchase).not.toHaveBeenCalled();
  });
  it.each([true, false])('ignores a stale background response after a newer access update (%s)', async (isPlus) => {
    const { service, provider, emit, access } = setup();
    let resolve!: (value: BillingAccess) => void;
    provider.getAccess.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const stop = await service.listenToPurchaseUpdates();
    const refresh = service.syncPurchase();
    emit({ isPlus });
    resolve({ isPlus: !isPlus });
    await refresh;
    expect(access().isPlus).toBe(isPlus);
    stop();
  });
  it('a refresh started before purchase cannot undo the successful purchase', async () => {
    const { service, provider, access } = setup();
    let resolve!: (value: BillingAccess) => void;
    provider.getAccess.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const refresh = service.syncPurchase();
    await service.buyLifetime((await service.getLifetimeProduct())!);
    resolve({ isPlus: false });
    await refresh;
    expect(access().isPlus).toBe(true);
  });
  it.each([true, false])('uses the latest requested refresh regardless of response order (%s)', async (olderFirst) => {
    const { service, provider, access } = setup();
    let resolveOld!: (value: BillingAccess) => void;
    let resolveNew!: (value: BillingAccess) => void;
    provider.getAccess.mockReturnValueOnce(new Promise((done) => { resolveOld = done; }));
    provider.getAccess.mockReturnValueOnce(new Promise((done) => { resolveNew = done; }));
    const oldRefresh = service.syncPurchase();
    const newRefresh = service.syncPurchase();
    if (olderFirst) {
      resolveOld({ isPlus: false });
      await oldRefresh;
      resolveNew({ isPlus: true });
    } else {
      resolveNew({ isPlus: true });
      await newRefresh;
      resolveOld({ isPlus: false });
    }
    await Promise.all([oldRefresh, newRefresh]);
    expect(access().isPlus).toBe(true);
  });
  it('stops listening once and ignores already queued callbacks after cleanup', async () => {
    const { service, stop, emit, access } = setup();
    const unsubscribe = await service.listenToPurchaseUpdates();
    emit({ isPlus: true });
    unsubscribe();
    unsubscribe();
    emit({ isPlus: false });
    expect(access().isPlus).toBe(true);
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
