import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { PHYSICS_DICE_HTML } from './physicsDiceHtml';
import { DiceResultPopup } from './DiceResultPopup';
import { InstantPressable } from '../../navigation/InstantPressable';
import { neu, affect } from '../../theme/neumorph';
import { spacing, radius } from '../../theme/tokens';
import { haptic } from '../../lib/haptics';

export type DiceCount = 1 | 2 | 3 | 4 | 5 | 6;

type RollerProps = {
  count?: DiceCount;
  onCountConsumed?: () => void;
};

/** Physics stage + result modal. WebView owns swipe-to-roll. */
export function DiceRoller({ count = 2, onCountConsumed }: RollerProps) {
  const webRef = useRef<WebView>(null);
  const [rolling, setRolling] = useState(false);
  const [ready, setReady] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [details, setDetails] = useState<number[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const countRef = useRef(count);
  countRef.current = count;
  const rollingRef = useRef(false);

  const inject = useCallback((js: string) => {
    webRef.current?.injectJavaScript(`${js}\ntrue;`);
  }, []);

  useEffect(() => {
    if (!ready || rollingRef.current || popupOpen) return;
    inject(`window.wafflrSetCount && window.wafflrSetCount(${count})`);
  }, [count, ready, inject, popupOpen]);

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      let data: {
        type: string;
        total?: number;
        details?: number[];
      };
      try {
        data = JSON.parse(e.nativeEvent.data);
      } catch {
        return;
      }

      switch (data.type) {
        case 'ready':
          setReady(true);
          inject(
            `window.wafflrSetCount && window.wafflrSetCount(${countRef.current})`,
          );
          break;

        case 'rolling':
          rollingRef.current = true;
          setRolling(true);
          setPopupOpen(false);
          setTotal(null);
          setDetails([]);
          haptic.medium();
          break;

        case 'result':
          rollingRef.current = false;
          setRolling(false);
          setTotal(typeof data.total === 'number' ? data.total : 0);
          setDetails(Array.isArray(data.details) ? data.details : []);
          setPopupOpen(true);
          haptic.success();
          break;

        case 'idle':
          rollingRef.current = false;
          setRolling(false);
          break;

        default:
          break;
      }
    },
    [inject],
  );

  const dismissAndReset = useCallback(() => {
    setPopupOpen(false);
    setTotal(null);
    setDetails([]);
    rollingRef.current = false;
    setRolling(false);
    requestAnimationFrame(() => {
      inject('window.wafflrReset && window.wafflrReset()');
    });
    onCountConsumed?.();
  }, [inject, onCountConsumed]);

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
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          nestedScrollEnabled={false}
          pointerEvents={popupOpen ? 'none' : 'auto'}
          containerStyle={styles.webContainer}
          {...(Platform.OS === 'android'
            ? { androidLayerType: 'hardware' as const }
            : {})}
        />

        {!ready ? (
          <View style={styles.loading} pointerEvents="none">
            <Text style={styles.loadingText}>Setting the table…</Text>
          </View>
        ) : null}

        {rolling ? (
          <View style={styles.rollingBadge} pointerEvents="none">
            <Text style={styles.rollingText}>Rolling…</Text>
          </View>
        ) : null}
      </View>

      <DiceResultPopup
        visible={popupOpen && total != null}
        total={total ?? 0}
        details={details}
        onDismiss={dismissAndReset}
      />
    </View>
  );
}

export function DiceCountPills({
  count,
  onChange,
  disabled,
}: {
  count: DiceCount;
  onChange: (n: DiceCount) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.pills}>
      {([1, 2, 3, 4, 5, 6] as DiceCount[]).map((n) => {
        const active = count === n;
        return (
          <InstantPressable
            key={n}
            disabled={disabled}
            onPress={() => onChange(n)}
            style={[
              styles.pill,
              active && styles.pillActive,
              disabled ? styles.pillDisabled : null,
            ]}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>
              {n}
            </Text>
          </InstantPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },
  stage: {
    flex: 1,
    width: '100%',
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    backgroundColor: '#145A40',
    borderWidth: 3,
    borderColor: '#0F4530',
  },
  web: { flex: 1, backgroundColor: 'transparent' },
  webContainer: { flex: 1, backgroundColor: '#145A40' },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#145A40',
  },
  loadingText: { fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  rollingBadge: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  rollingText: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    fontWeight: '800',
    fontSize: 12,
    color: affect.delight.text,
  },
  pills: { flexDirection: 'row', gap: spacing[2], width: '100%' },
  pill: {
    flex: 1,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
  },
  pillActive: {
    backgroundColor: affect.delight.soft,
    borderColor: affect.delight.solid,
  },
  pillDisabled: { opacity: 0.5 },
  pillText: { fontSize: 16, fontWeight: '800', color: neu.text },
  pillTextActive: { color: affect.delight.text },
});
