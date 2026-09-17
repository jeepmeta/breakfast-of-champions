# Wafflr (`breakfast-of-champions`)

Sleek, gamified utility + social decision-making platform that eliminates low-stakes decision fatigue, group deadlocks, and choice paralysis.

**Fairness** via randomness + algorithmic consensus · **≤60s sessions** · works from 1-on-1 to 100+ anonymous polls.

## Stack

- **Expo** + **React Native** (Expo Router, file-based routing)
- **TypeScript**
- Real-time: Supabase Realtime / WebSockets (planned)
- Design system: semantic light/dark tokens (`src/theme`)
- Physics & haptics: Reanimated + `expo-haptics`

## Getting started

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android), or scan the QR with Expo Go.

## Project structure

```
src/
  app/           # (routes live in /app at root for Expo Router)
  components/    # reusable UI
  screens/       # screen bodies (optional colocation)
  hooks/
  theme/         # design tokens (colors, spacing, radius)
  types/         # Room, Participant, mode state
  utils/
```

Canonical product specs live in the monorepo / project docs:

- `design-tokens.md`
- `animation-haptic-constants.md`
- `room-state-schemas.md`
- `sample-item-catalogs.md`
- `app-store-listing-reference.md`

## Core modes (build order)

1. Real-time multiplayer rooms + mutual-match swipe
2. Physics chance mechanics (Wheel, Dice, Coin, Dart)
3. Brackets / series / large polls

## License

Private / proprietary for now.
