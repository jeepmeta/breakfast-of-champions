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
  width?: number;
  height?: number;
  borderColor?: string;
  cardStyle?: ViewStyle;
};

/**
 * Playing-card result modal.
 *
 * Critical layout rule: fixed width/height live on a NON-animated outer box.
 * Scale/opacity only run on the inner wrapper so RN never collapses the frame.
 */
export function ResultPopup({
  visible,
  onDismiss,
  children,
  width = 248,
  height = 380,
  borderColor = colors.brand.amber[400],
  cardStyle,
}: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 160 });
      scale.value = withSpring(1, SPRINGS.bouncy);
    } else {
      opacity.value = 0;
      scale.value = 0.92;
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
      <GestureHandlerRootView style={styles.fill}>
        <View style={styles.root} pointerEvents="box-none">
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, backdropStyle]}
          />

          {/* Full-screen dismiss — behind the card */}
          <Pressable
            style={styles.dismissHit}
            onPress={dismiss}
            accessibilityLabel="Dismiss"
          />

          {/* FIXED layout frame — never animated */}
          <View
            style={[styles.frame, { width, height }]}
            pointerEvents="box-none"
          >
            <Animated.View style={[styles.animWrap, cardAnim]}>
              <View
                style={[
                  styles.card,
                  {
                    width,
                    height,
                    borderColor,
                  },
                  cardStyle,
                ]}
              >
                {children}
              </View>
            </Animated.View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  frame: {
    zIndex: 2,
    // Explicit box — prevents flex collapse under Modal
    alignItems: 'center',
    justifyContent: 'center',
  },
  animWrap: {
    width: '100%',
    height: '100%',
  },
  card: {
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    paddingTop: 22,
    paddingHorizontal: 14,
    paddingBottom: 18,
    overflow: 'hidden',
    flexDirection: 'column',
    // Hard min so content can't squash the face
    minHeight: 320,
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 18,
  },
});
