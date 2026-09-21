import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SubscriptionState = {
  isSubscribed: boolean;
  setSubscribed: (v: boolean) => void;
};

/** Local subscription gate — ads hidden when true. Wire StoreKit later. */
export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      isSubscribed: false,
      setSubscribed: (v) => set({ isSubscribed: !!v }),
    }),
    {
      name: 'wafflr-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ isSubscribed: s.isSubscribed }),
    },
  ),
);

/** Hook-shaped API matching the old Context consumer. */
export function useSubscription() {
  const isSubscribed = useSubscriptionStore((s) => s.isSubscribed);
  const setSubscribed = useSubscriptionStore((s) => s.setSubscribed);
  return { isSubscribed, setSubscribed };
}
