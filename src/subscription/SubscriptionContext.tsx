import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type Ctx = {
  isSubscribed: boolean;
  setSubscribed: (v: boolean) => void;
};

const SubscriptionContext = createContext<Ctx | null>(null);

/** Local subscription gate — ads hidden when true. */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isSubscribed, setSubscribed] = useState(false);
  const value = useMemo(
    () => ({ isSubscribed, setSubscribed }),
    [isSubscribed],
  );
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return ctx;
}
