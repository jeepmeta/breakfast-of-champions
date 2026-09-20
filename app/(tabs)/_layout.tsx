import { Redirect } from 'expo-router';

/** Tab bar removed — all entry points are home cards. */
export default function TabsRemoved() {
  return <Redirect href="/" />;
}
