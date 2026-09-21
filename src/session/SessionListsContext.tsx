/**
 * @deprecated Use sessionListsStore — re-exports for existing imports.
 */
export {
  useSessionLists,
  useSessionListsStore,
  type SessionEntry,
} from './sessionListsStore';

/** No-op provider — store needs no React tree. */
export function SessionListsProvider({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}
