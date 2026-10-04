import { Platform } from 'react-native';
import { useProStore } from '@/store/proStore';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

const ENTITLEMENT = 'ssak_plus';
export class PurchasePendingError extends Error {
  constructor() { super('purchase-pending'); }
}
const getKey = () =>
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
export const billingAvailable = () => Platform.OS !== 'web' && Boolean(getKey());
const getClient = async () => {
  if (!billingAvailable()) throw new Error('billing-unavailable');
  const { default: Purchases } = await import('react-native-purchases');
  if (!(await Purchases.isConfigured())) Purchases.configure({ apiKey: getKey() ?? '' });
  return Purchases;
};
const applyCustomer = (customer: CustomerInfo): boolean => {
  const active = Boolean(customer.entitlements.active[ENTITLEMENT]);
  useProStore.getState().setPro(active);
  return active;
};
export const syncPurchase = async (): Promise<void> => {
  if (!billingAvailable()) return;
  const client = await getClient();
  applyCustomer(await client.getCustomerInfo());
};
export const listenToPurchaseUpdates = async (): Promise<() => void> => {
  if (!billingAvailable()) return () => {};
  const client = await getClient();
  const listener = (customer: CustomerInfo) => { applyCustomer(customer); };
  client.addCustomerInfoUpdateListener(listener);
  return () => client.removeCustomerInfoUpdateListener(listener);
};
export const getLifetimePackage = async (): Promise<PurchasesPackage | null> => {
  if (!billingAvailable()) return null;
  const client = await getClient();
  const offerings = await client.getOfferings();
  return offerings.current?.lifetime ?? null;
};
export const buyLifetime = async (item: PurchasesPackage): Promise<boolean> => {
  const client = await getClient();
  if (item.packageType !== client.PACKAGE_TYPE.LIFETIME) throw new Error('not-lifetime');
  try {
    const { customerInfo } = await client.purchasePackage(item);
    return applyCustomer(customerInfo);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error &&
        error.code === client.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR)
      throw new PurchasePendingError();
    throw error;
  }
};
export const restoreLifetime = async (): Promise<boolean> => {
  const client = await getClient();
  return applyCustomer(await client.restorePurchases());
};
