import { Platform } from 'react-native';
import type Purchases from 'react-native-purchases';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { BillingError, type BillingAccess, type BillingProvider, type LifetimeProduct } from './types';

const ENTITLEMENT = 'ssak_plus';
const getKey = () => {
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  return undefined;
};
const accessFromCustomer = (customer: CustomerInfo): BillingAccess => ({
  isPlus: Boolean(customer.entitlements.active[ENTITLEMENT]),
});

export const createRevenueCatProvider = (): BillingProvider => {
  let initializing: Promise<typeof Purchases> | undefined;
  // Keep the original offering context for purchase attribution without exposing it to the UI.
  const packages = new WeakMap<LifetimeProduct, PurchasesPackage>();
  const isAvailable = () => Boolean(getKey());
  const getClient = (): Promise<typeof Purchases> => {
    const apiKey = getKey();
    if (!apiKey) return Promise.reject(new BillingError('unavailable'));
    if (!initializing) {
      initializing = (async () => {
        const { default: client } = await import('react-native-purchases');
        if (!(await client.isConfigured())) client.configure({ apiKey });
        return client;
      })().finally(() => { initializing = undefined; });
    }
    return initializing;
  };
  const withClient = async <T>(operation: (client: typeof Purchases) => Promise<T>): Promise<T> => {
    let client: typeof Purchases | undefined;
    try {
      client = await getClient();
      return await operation(client);
    } catch (error) {
      if (error instanceof BillingError) throw error;
      if (client && typeof error === 'object' && error !== null) {
        const code = 'code' in error ? error.code : undefined;
        if (code === client.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR)
          throw new BillingError('pending');
        if (code === client.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR ||
            ('userCancelled' in error && error.userCancelled === true))
          throw new BillingError('cancelled');
      }
      throw new BillingError('failed');
    }
  };
  const requireLifetime = (item: PurchasesPackage, client: typeof Purchases) => {
    if (item.packageType !== client.PACKAGE_TYPE.LIFETIME ||
        item.product.productCategory !== client.PRODUCT_CATEGORY.NON_SUBSCRIPTION ||
        item.product.subscriptionPeriod != null)
      throw new BillingError('invalid-product');
  };

  return {
    isAvailable,
    getLifetimeProduct: () => withClient(async (client) => {
      const item = (await client.getOfferings()).current?.lifetime;
      if (!item) return null;
      requireLifetime(item, client);
      const product: LifetimeProduct = Object.freeze({
        id: item.product.identifier,
        displayPrice: item.product.priceString,
      });
      packages.set(product, item);
      return product;
    }),
    purchase: (product) => withClient(async (client) => {
      const item = packages.get(product);
      if (!item) throw new BillingError('invalid-product');
      requireLifetime(item, client);
      const { customerInfo } = await client.purchasePackage(item);
      return accessFromCustomer(customerInfo);
    }),
    restore: () => withClient(async (client) => accessFromCustomer(await client.restorePurchases())),
    getAccess: () => withClient(async (client) => accessFromCustomer(await client.getCustomerInfo())),
    subscribe: (listener) => withClient(async (client) => {
      const onCustomer = (customer: CustomerInfo) => listener(accessFromCustomer(customer));
      client.addCustomerInfoUpdateListener(onCustomer);
      return () => client.removeCustomerInfoUpdateListener(onCustomer);
    }),
  };
};
