import { View, Text, Pressable } from 'react-native';

import { PlayChrome } from '../../components/play/PlayChrome';
import { SwipeDeck } from '../../components/swipe/SwipeDeck';
import type { CatalogItem } from '../../data/catalogs';
import { neu } from '../../theme/neumorph';
import { roomStyles as styles } from '../roomStyles';

type Props = {
  code: string;
  item: CatalogItem;
  remaining: number;
  vetoEnabled: boolean;
  vetoesRemaining: number;
  onSwipe: (dir: 'left' | 'right') => void;
  onVeto: () => void;
};

export function RoomSwipe({
  code,
  item,
  remaining,
  vetoEnabled,
  vetoesRemaining,
  onSwipe,
  onVeto,
}: Props) {
  return (
    <>
      <PlayChrome title="Swipe Match" subtitle={code} />
      <View style={styles.swipeHeader}>
        <Text style={styles.swipeTitle}>What are we getting?</Text>
      </View>
      <SwipeDeck
        key={item.id}
        item={item}
        remaining={remaining}
        vetoEnabled={vetoEnabled}
        vetoesRemaining={vetoesRemaining}
        onSwipe={onSwipe}
        onVeto={onVeto}
      />
    </>
  );
}

type WaitingProps = {
  code: string;
  onLeave: () => void;
};

export function RoomSwipeWaiting({ code, onLeave }: WaitingProps) {
  return (
    <>
      <PlayChrome title="Swipe Match" subtitle={code} />
      <View style={styles.body}>
        <Text style={styles.title}>Waiting on others…</Text>
        <Text style={styles.hint}>
          You finished the deck. Hang tight for a match.
        </Text>
        <Pressable onPress={onLeave} style={styles.back}>
          <Text style={{ color: neu.muted, fontSize: 16, fontWeight: '700' }}>
            Leave room
          </Text>
        </Pressable>
      </View>
    </>
  );
}

type CelebrateProps = {
  code: string;
  item: CatalogItem;
  onKeepSwiping: () => void;
  onLeave: () => void;
};

export function RoomSwipeCelebrate({
  code,
  item,
  onKeepSwiping,
  onLeave,
}: CelebrateProps) {
  return (
    <>
      <PlayChrome title="Match!" subtitle={code} />
      <View style={styles.celebrate}>
        <Text style={styles.celebrateEmoji}>{item.emoji}</Text>
        <Text style={styles.celebrateTitle}>It is a match!</Text>
        <Text style={styles.celebrateItem}>{item.title}</Text>
        <Text style={styles.hint}>
          Everyone agreed. Decision locked in under 60 seconds.
        </Text>
        <Pressable
          onPress={onKeepSwiping}
          style={({ pressed }) => [
            styles.primaryBtn,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.primaryBtnText}>Keep swiping</Text>
        </Pressable>
        <Pressable onPress={onLeave} style={styles.back}>
          <Text style={{ color: neu.muted, fontSize: 16, fontWeight: '700' }}>
            Done · Leave room
          </Text>
        </Pressable>
      </View>
    </>
  );
}
