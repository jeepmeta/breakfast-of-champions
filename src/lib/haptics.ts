import * as Haptics from 'expo-haptics';

/** Fire-and-forget haptics — never throws into UI. */
export const haptic = {
  light: () =>
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    ),
  medium: () =>
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    ),
  heavy: () =>
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
      () => undefined,
    ),
  selection: () =>
    void Haptics.selectionAsync().catch(() => undefined),
  success: () =>
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined),
};
