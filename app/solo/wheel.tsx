import { Redirect } from 'expo-router';

/** Legacy route — basic wheel lives at /play/wheel */
export default function SoloWheelRedirect() {
  return <Redirect href="/play/wheel" />;
}
