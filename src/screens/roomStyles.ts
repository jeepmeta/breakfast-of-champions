import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import {
  neu,
  neuCard,
  neuPill,
  neuPrimaryBtn,
  neuPrimaryBtnText,
  neuSecondaryBtn,
  neuSecondaryBtnText,
  neuSection,
  neuFloat,
  affect,
  elevationStyle,
} from '../theme/neumorph';
import { spacing, radius } from '../theme/tokens';

export const roomStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neu.canvas,
  },
  body: {
    flex: 1,
    padding: spacing[6],
    justifyContent: 'center',
    gap: spacing[3],
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
    alignItems: 'center',
    gap: spacing[1],
  },
  label: {
    ...neuSection,
  },
  code: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
    color: affect.reward.text,
  },
  readySummary: {
    fontSize: 14,
    fontWeight: '700',
    color: neu.muted,
    marginTop: spacing[1],
  },
  live: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing[1],
    color: affect.success.text,
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  sectionLabel: {
    ...neuSection,
    marginBottom: spacing[2],
    marginTop: spacing[2],
  },
  participantRow: {
    ...neuCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevationStyle('soft'),
  },
  avatarText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: neu.text,
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    color: neu.muted,
  },
  readyPill: {
    ...neuPill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  readyPillOn: {
    backgroundColor: affect.success.solid,
    borderColor: affect.success.solidStrong,
    ...elevationStyle('soft'),
  },
  readyPillOff: {
    backgroundColor: neu.cardInset,
  },
  readyPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  readyPillTextOn: {
    color: '#fff',
  },
  readyPillTextOff: {
    color: neu.muted,
  },
  footer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    gap: spacing[3],
  },
  primaryBtn: {
    ...neuPrimaryBtn,
  },
  primaryBtnText: {
    ...neuPrimaryBtnText,
    fontSize: 17,
  },
  secondaryBtn: {
    ...neuSecondaryBtn,
  },
  secondaryBtnText: {
    ...neuSecondaryBtnText,
  },
  back: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: neu.text,
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: neu.muted,
  },
  swipeHeader: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[1],
    alignItems: 'center',
    gap: spacing[1],
  },
  swipeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: neu.text,
  },
  celebrate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    gap: spacing[3],
  },
  celebrateEmoji: {
    fontSize: 64,
  },
  celebrateTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: affect.success.text,
  },
  celebrateItem: {
    fontSize: 22,
    fontWeight: '800',
    color: neu.text,
  },
  wheelScroll: {
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    paddingBottom: spacing[10],
  },
  stage: {
    ...neuCard,
    width: '100%',
    padding: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  wheelControls: {
    width: '100%',
    marginTop: spacing[4],
    alignItems: 'center',
    gap: spacing[2],
  },
  winnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    paddingHorizontal: spacing[6],
  },
  winnerCard: {
    ...neuFloat,
    width: '100%',
    maxWidth: 340,
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    gap: spacing[1],
  },
  winnerCardEmoji: {
    fontSize: 56,
    marginBottom: spacing[2],
  },
  winnerCardName: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    color: affect.success.text,
  },
  winnerCardSub: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing[2],
    color: neu.muted,
  },
  winnerCardBtn: {
    marginTop: spacing[4],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
    borderRadius: radius.full,
    backgroundColor: affect.success.solid,
    ...elevationStyle('soft'),
  },
  winnerCardBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  startHint: {
    marginTop: spacing[1],
    fontSize: 14,
    fontWeight: '600',
    color: neu.muted,
  },
  tallyBox: {
    width: '100%',
    marginTop: spacing[5],
    ...neuCard,
    padding: spacing[3],
  },
  tallySectionLabel: {
    ...neuSection,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  tallyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
  },
  tallyChip: {
    ...neuPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: 6,
    paddingHorizontal: spacing[3],
    maxWidth: '48%',
  },
  tallyChipName: {
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
    color: neu.text,
  },
  tallyChipWins: {
    fontSize: 13,
    fontWeight: '900',
    color: affect.reward.text,
  },
  lobbyWrap: {
    ...neuCard,
    marginHorizontal: 0,
    padding: spacing[4],
    marginBottom: spacing[1],
  },
});
