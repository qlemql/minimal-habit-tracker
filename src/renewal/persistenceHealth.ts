import { create } from 'zustand';

type StorageKey = 'habit-store' | 'pro-store' | 'ssak-preferences';
type HydrationStatus = 'loading' | 'ready' | 'error';
interface PersistenceHealth {
  stores: Record<StorageKey, HydrationStatus>;
  update: (key: StorageKey, status: HydrationStatus) => void;
}

// Separate, non-persisted state remains available even when a stored JSON file is unreadable.
export const usePersistenceHealth = create<PersistenceHealth>((set) => ({
  stores: { 'habit-store': 'loading', 'pro-store': 'loading', 'ssak-preferences': 'loading' },
  update: (key, status) => set((state) => ({ stores: { ...state.stores, [key]: status } })),
}));

export const observeHydration = (key: StorageKey) => () => {
  usePersistenceHealth.getState().update(key, 'loading');
  return (_state: unknown, error?: unknown) => {
    usePersistenceHealth.getState().update(key, error ? 'error' : 'ready');
  };
};
