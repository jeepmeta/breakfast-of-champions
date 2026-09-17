# Wafflr (`breakfast-of-champions`)

Sleek, gamified utility + social decision-making platform.

**Fairness** via randomness + consensus · **≤60s sessions** · 1-on-1 to 100+ polls.

## Stack

- Expo SDK 57 + Expo Router
- React Native 0.86 / React 19.2
- Reanimated 4 + expo-haptics
- TypeScript

## Run

```bash
npm install
npx expo start
```

Scan the QR with **Expo Go** (SDK 57).

## Structure

```
app/                 # Expo Router screens
  index.tsx          # Home
  room/[code].tsx    # Room lobby
  solo/wheel.tsx     # Solo wheel placeholder
src/theme/           # Design tokens
src/types/           # Room schemas
```

## Core modes (next)

1. Real-time multiplayer + swipe match
2. Physics wheel / dice / coin
3. Brackets & large polls
