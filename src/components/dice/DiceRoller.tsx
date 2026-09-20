import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Haptics from 'expo-haptics';

import { PHYSICS_DICE_HTML } from './physicsDiceHtml';
import { DiceResultPopup } from './DiceResultPopup';
import { InstantPressable } from '../../navigation/InstantPressable';
import { colors } from '../../theme/colors';
import { neu, affect } from '../../theme/neumorph';
import { spacing, radius } from '../../theme/tokens';

export type DiceCount = 1 | 2 | 3 | 4 | 5 | 6;

/** Physics stage only — pills live in the parent play screen. */
export function DiceRoller({
  count = 2,
  onCountConsumed,
}: {
  count?: DiceCount;
  onCountConsumed?: () => void;
}) {
  const webRef = useRef<WebView>(null);
  const [rolling, setRolling] = useState(false);
  const [ready, setReady] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [details, setDetails] = useState<number[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const countRef = useRef(count);
  countRef.current = count;

  const inject = useCallback((js: string) => {
    webRef.current?.injectJavaScript(`${js}; true;`);
  }, []);

  useEffect(() => {
    if (!ready) return;
    inject(`window.wafflrSetCount && window.wafflrSetCount(${count})`);
  }, [count, ready, inject]);

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
          inject(
            `window.wafflrSetCount && window.wafflrSetCount(${countRef.current})`,
          );
        } else if (data.type === 'rolling') {
          setRolling(true);
          setPopupOpen(false);
          setTotal(null);
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => undefined,
          );
        } else if (data.type === 'result') {
          setRolling(false);
          setTotal(data.total ?? 0);
          setDetails(data.details ?? []);
          setPopupOpen(true);
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          ).catch(() => undefined);
        } else if (data.type === 'idle') {
          setRolling(false);
        }
      } catch {
        // ignore
      }
    },
    [inject],
  );

  const dismissAndReset = () => {
    setPopupOpen(false);
    setTotal(null);
    setDetails([]);
    inject('window.wafflrReset && window.wafflrReset()');
    onCountConsumed?.();
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
              disabled && styles.pillDisabled,
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
    alignSelf: 'center',
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
