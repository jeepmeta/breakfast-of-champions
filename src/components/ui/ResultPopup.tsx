import { useEffect, type ReactNode } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { SPRINGS } from '../../constants/springs';
import { haptic } from '../../lib/haptics';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
  /** Fixed card size */
  width?: number;
  height?: number;
  borderColor?: string;
  cardStyle?: ViewStyle;
};

/**
 * Shared modal shell for dice / wheel result cards.
 * Fixed-size card on top of dim + dismiss hit layer.
 */
export function ResultPopup({
  visible,
  onDismiss,
  children,
  width = 240,
  height = 360,
  borderColor = colors.brand.amber[400],
  cardStyle,
}: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 140 });
      scale.value = withSpring(1, SPRINGS.bouncy);
    } else {
      opacity.value = 0;
      scale.value = 0.9;
    }
  }, [visible, opacity, scale]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.55,
  }));

  const cardAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const dismiss = () => {
    haptic.light();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <GestureHandlerRootView style={styles.flex}>
        <View style={styles.root}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, backdropStyle]}
          />
          <Pressable
            style={styles.dismissHit}
            onPress={dismiss}
            accessibilityLabel="Dismiss"
          />
          <Animated.View
            style={[
              styles.shell,
              { width, height },
              cardAnim,
            ]}
          >
            <View
              style={[
                styles.card,
                { width, height, borderColor },
                cardStyle,
              ]}
            >
              {children}
            </View>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.brand.slate[900],
  },
  dismissHit: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  shell: {
    zIndex: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 12,
    paddingBottom: 16,
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 16,
  },
});
