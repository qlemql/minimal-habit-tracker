import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copies } from '../src/renewal/copy';
import { releaseCopy } from '../src/renewal/releaseCopy';
import { BillingError } from '../src/billing/types';
import { useProStore } from '../src/store/proStore';
import Plus from '../app/plus';

const billing = vi.hoisted(() => ({ buy: vi.fn(), restore: vi.fn(), scrollTo: vi.fn() }));
vi.mock('@/renewal/billing', async () => ({
  BillingError: (await import('../src/billing/types')).BillingError,
  billingAvailable: () => true,
  getLifetimeProduct: async () => ({ id: 'lifetime', displayPrice: '₩4,900' }),
  buyLifetime: billing.buy,
  restoreLifetime: billing.restore,
}));
vi.mock('react-native', () => ({
  View: 'View', Text: 'Text', Pressable: 'Pressable', ScrollView: 'ScrollView',
  ActivityIndicator: 'ActivityIndicator', TextInput: 'TextInput',
  Platform: { OS: 'ios', select: (values: Record<string, unknown>) => values.ios ?? values.default },
  StyleSheet: { create: (styles: unknown) => styles, absoluteFillObject: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 } },
  useWindowDimensions: () => ({ width: 375, height: 812 }),
  AppState: { addEventListener: () => ({ remove: () => {} }) },
}));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
vi.mock('react-native-svg', () => ({ default: 'Svg', Path: 'Path', Circle: 'Circle', Rect: 'Rect', Ellipse: 'Ellipse', G: 'G' }));
vi.mock('expo-router', () => ({
  usePathname: () => '/plus',
  useRouter: () => ({ canGoBack: () => true, back: vi.fn(), replace: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/renewal/preferences', () => ({
  useCopy: () => copies.ko,
  usePreferences: (select: (state: { language: string }) => unknown) => select({ language: 'ko' }),
}));

let tree: ReactTestRenderer;
const host = (type: string) => tree.root.findAll((node) => node.type as unknown === type);
const press = (label: string) => host('Pressable').find((node) => node.props.accessibilityRole === 'button'
  && JSON.stringify(node.findAll((child) => child.type as unknown === 'Text').map((child) => child.props.children)).includes(label))!;
const progress = () => host('View').find((node) => node.props.testID === 'billing-progress');
const text = () => host('Text').map((node) => node.props.children).join(' ');

beforeEach(async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  useProStore.getState().setPro(false);
  await act(async () => {
    tree = create(createElement(Plus), { createNodeMock: (element) => element.type as unknown === 'ScrollView' ? { scrollTo: billing.scrollTo } : null });
  });
});
afterEach(async () => { await act(async () => tree.unmount()); });

describe('Plus purchase feedback', () => {
  it('keeps progress outside the locked scroll area, prevents repeated purchase, then reveals success at the top', async () => {
    let complete!: (value: boolean) => void;
    billing.buy.mockReturnValueOnce(new Promise<boolean>((resolve) => { complete = resolve; }));
    const buy = press(copies.ko.buy);
    await act(async () => { buy.props.onPress(); buy.props.onPress(); });
    expect(billing.buy).toHaveBeenCalledTimes(1);
    expect(text()).toContain(releaseCopy.ko.processingPurchase);
    expect(host('ActivityIndicator')).toHaveLength(1);
    expect(host('ScrollView')[0].props.scrollEnabled).toBe(false);
    expect(host('ScrollView')[0].props.bounces).toBe(false);
    expect(host('ScrollView')[0].findAll((node) => node.props.testID === 'billing-progress')).toHaveLength(0);
    expect(progress()).toBeDefined();
    expect(host('View').some((node) => node.props.pointerEvents === 'none' && node.props.accessibilityElementsHidden)).toBe(true);
    billing.scrollTo.mockClear();
    await act(async () => { useProStore.getState().setPro(true); complete(true); });
    expect(progress()).toBeUndefined();
    expect(host('ScrollView')[0].props.scrollEnabled).toBe(true);
    expect(text()).toContain(copies.ko.purchased);
    expect(text()).toContain(copies.ko.plusActive);
    expect(billing.scrollTo).toHaveBeenCalledWith({ y: 0, animated: false });
    await act(async () => useProStore.getState().setPro(false));
    expect(text()).not.toContain(copies.ko.purchased);
    expect(press(copies.ko.buy).props.disabled).toBe(false);
  });

  it.each(['cancelled', 'failed', 'pending'] as const)('releases the screen after %s without claiming success', async (code) => {
    billing.buy.mockRejectedValueOnce(new BillingError(code));
    await act(async () => press(copies.ko.buy).props.onPress());
    expect(progress()).toBeUndefined();
    expect(host('ScrollView')[0].props.scrollEnabled).toBe(true);
    expect(text()).not.toContain(copies.ko.purchased);
    if (code === 'failed') expect(text()).toContain(copies.ko.purchaseError);
    if (code === 'pending') {
      expect(text()).toContain(releaseCopy.ko.purchasePending);
      expect(press(copies.ko.buy).props.disabled).toBe(true);
    }
    if (code === 'cancelled') expect(press(copies.ko.buy).props.disabled).toBe(false);
  });

  it('shows distinct restore feedback and unlocks after an empty restore', async () => {
    let complete!: (value: boolean) => void;
    billing.restore.mockReturnValueOnce(new Promise<boolean>((resolve) => { complete = resolve; }));
    await act(async () => press(copies.ko.restorePurchase).props.onPress());
    expect(text()).toContain(releaseCopy.ko.restoringPurchase);
    expect(progress()).toBeDefined();
    await act(async () => complete(false));
    expect(progress()).toBeUndefined();
    expect(text()).toContain(copies.ko.nothingRestore);
    expect(host('ScrollView')[0].props.scrollEnabled).toBe(true);
  });
});
