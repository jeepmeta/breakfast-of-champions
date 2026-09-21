/**
 * @deprecated Use subscriptionStore — re-exports for existing imports.
 */
export {
  useSubscription,
  useSubscriptionStore,
} from './subscriptionStore';

/** No-op provider — store needs no React tree. */
export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}
