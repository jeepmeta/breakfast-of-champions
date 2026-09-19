import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { PHYSICS_DICE_HTML } from './physicsDiceHtml';
import { DiceResultPopup } from './DiceResultPopup';
import { colors } from '../../theme/colors';
import { neu } from '../../theme/neumorph';
import { spacing, radius } from '../../theme/tokens';
import { SPRINGS } from '../../constants/springs';

type DiceCount = 1 | 2 | 3 | 4 | 5;

type Props = {
  dieSize?: number;
};

/** Physics dice table + animated total popup. */
export function DiceRoller(_props: Props) {
  const webRef = useRef<WebView>(null);
  const [count, setCount] = useState<DiceCount>(1);
  const [rolling, setRolling] = useState(false);
  const [ready, setReady] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [details, setDetails] = useState<number[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const inject = useCallback((js: string) => {
    webRef.current?.injectJavaScript(`${js}; true;`);
  }, []);

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(e.nativeEvent.data) as {
          type: string;
          total?: number;
          details?: number[];
        };
        if (data.type === 'ready') {
          setReady(true);
          inject(`window.wafflrSetCount && window.wafflrSetCount(${count})`);
        } else if (data.type === 'rolling') {
          setRolling(true);
          setPopupOpen(false);
          setTotal(null);
        } else if (data.type === 'result') {
          setRolling(false);
          setTotal(data.total ?? 0);
          setDetails(data.details ?? []);
          setPopupOpen(true);
        }
      } catch {
        // ignore
      }
    },
    [count, inject],
  );

  const changeCount = (n: DiceCount) => {
    if (rolling) return;
    setCount(n);
    setTotal(null);
    setDetails([]);
    setPopupOpen(false);
    inject(`window.wafflrSetCount && window.wafflrSetCount(${n})`);
  };

  const roll = async () => {
    if (rolling || !ready) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    btnScale.value = withSpring(0.94, SPRINGS.stiff, () => {
      btnScale.value = withSpring(1, SPRINGS.bouncy);
    });
    setPopupOpen(false);
    inject('window.wafflrRoll && window.wafflrRoll()');
  };

  const rollAgain = () => {
    setPopupOpen(false);
    void roll();
  };

  return (
    <View style={styles.root}>
      <View style={styles.stage}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html: PHYSICS_DICE_HTML }}
          onMessage={onMessage}
          style={styles.web}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          containerStyle={styles.webContainer}
        />
        {!ready ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Loading table…</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.scoreBlock}>
        {rolling ? (
          <Text style={styles.scorePlaceholder}>Rolling…</Text>
        ) : total != null && !popupOpen ? (
          <Text style={styles.scoreHint}>Last total · {total}</Text>
        ) : (
          <Text style={styles.scorePlaceholder}>Ready</Text>
        )}
      </View>

      <Animated.View style={btnStyle}>
        <Pressable
          onPress={roll}
          disabled={rolling || !ready}
          accessibilityRole="button"
          accessibilityLabel="Roll dice"
          style={({ pressed }) => [
            styles.rollBtn,
            { opacity: rolling || !ready ? 0.55 : pressed ? 0.92 : 1 },
          ]}
        >
          <Text style={styles.rollBtnText}>{rolling ? '…' : 'ROLL'}</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.pills}>
        {([1, 2, 3, 4, 5] as DiceCount[]).map((n) => {
          const active = count === n;
          return (
            <Pressable
              key={n}
              disabled={rolling}
              onPress={() => changeCount(n)}
              style={[
                styles.pill,
                active && styles.pillActive,
                rolling && styles.pillDisabled,
              ]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.pillHint}>Dice count</Text>

      <DiceResultPopup
        visible={popupOpen && total != null}
        total={total ?? 0}
        details={details}
        onClose={() => setPopupOpen(false)}
        onRollAgain={rollAgain}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  stage: {
    flex: 1,
    width: '100%',
    minHeight: 260,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    backgroundColor: neu.canvas,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
  },
  web: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webContainer: {
    flex: 1,
    backgroundColor: neu.canvas,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: neu.canvas,
  },
  loadingText: {
    fontWeight: '700',
    color: neu.muted,
  },
  scoreBlock: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
  },
  scoreHint: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand.pink[600],
  },
  scorePlaceholder: {
    fontSize: 14,
    fontWeight: '600',
    color: neu.muted,
  },
  rollBtn: {
    backgroundColor: colors.brand.pink[500],
    paddingHorizontal: spacing[12],
    minHeight: 58,
    minWidth: 180,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand.pink[800],
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    marginTop: spacing[1],
  },
  rollBtnText: {
    color: colors.brand.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  pill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
  },
  pillActive: {
    backgroundColor: colors.brand.pink[100],
    borderColor: colors.brand.pink[500],
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillText: {
    fontSize: 16,
    fontWeight: '800',
    color: neu.text,
  },
  pillTextActive: {
    color: colors.brand.pink[700],
  },
  pillHint: {
    marginTop: spacing[1],
    fontSize: 11,
    fontWeight: '600',
    color: neu.muted,
    marginBottom: Platform.OS === 'web' ? spacing[2] : 0,
  },
});
