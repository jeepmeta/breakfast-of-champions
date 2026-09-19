/**
 * Basic solo wheel topics — general subjects for instant decisions.
 * Room vision: land on a topic → generate location/streaming cards → swipe match.
 */

export type WheelTopicId = 'eat' | 'watch' | 'do';

export type WheelVariationId =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'tv'
  | 'movie'
  | 'indoor'
  | 'outdoor';

export type WheelTopicSegment = {
  id: string;
  label: string;
  emoji: string;
};

export type WheelVariation = {
  id: WheelVariationId;
  label: string;
  emoji: string;
  question: string;
  segments: WheelTopicSegment[];
};

export type WheelTopic = {
  id: WheelTopicId;
  label: string;
  emoji: string;
  question: string;
  variations: WheelVariation[];
};

const BREAKFAST: WheelTopicSegment[] = [
  { id: 'bf_eggs', label: 'Eggs', emoji: '🍳' },
  { id: 'bf_pancakes', label: 'Pancakes', emoji: '🥞' },
  { id: 'bf_smoothie', label: 'Smoothie', emoji: '🥤' },
  { id: 'bf_bagel', label: 'Bagel', emoji: '🥯' },
  { id: 'bf_oatmeal', label: 'Oatmeal', emoji: '🥣' },
  { id: 'bf_avocado', label: 'Avo toast', emoji: '🥑' },
  { id: 'bf_cereal', label: 'Cereal', emoji: '🥣' },
  { id: 'bf_burrito', label: 'Burrito', emoji: '🌯' },
];

const LUNCH: WheelTopicSegment[] = [
  { id: 'ln_salad', label: 'Salad', emoji: '🥗' },
  { id: 'ln_sandwich', label: 'Sandwich', emoji: '🥪' },
  { id: 'ln_soup', label: 'Soup', emoji: '🍲' },
  { id: 'ln_sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'ln_tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'ln_bowl', label: 'Grain bowl', emoji: '🍚' },
  { id: 'ln_pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'ln_leftovers', label: 'Leftovers', emoji: '🥡' },
];

const DINNER: WheelTopicSegment[] = [
  { id: 'dn_pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'dn_sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'dn_tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'dn_burger', label: 'Burgers', emoji: '🍔' },
  { id: 'dn_thai', label: 'Thai', emoji: '🍜' },
  { id: 'dn_italian', label: 'Italian', emoji: '🍝' },
  { id: 'dn_ramen', label: 'Ramen', emoji: '🍥' },
  { id: 'dn_mexican', label: 'Mexican', emoji: '🫔' },
];

const TV: WheelTopicSegment[] = [
  { id: 'tv_comedy', label: 'Comedy', emoji: '😂' },
  { id: 'tv_drama', label: 'Drama', emoji: '🎭' },
  { id: 'tv_reality', label: 'Reality', emoji: '📺' },
  { id: 'tv_scifi', label: 'Sci-Fi', emoji: '🚀' },
  { id: 'tv_doc', label: 'Docuseries', emoji: '🎥' },
  { id: 'tv_anime', label: 'Anime', emoji: '🎌' },
  { id: 'tv_crime', label: 'Crime', emoji: '🔍' },
  { id: 'tv_romcom', label: 'Rom-com', emoji: '💕' },
];

const MOVIE: WheelTopicSegment[] = [
  { id: 'mv_action', label: 'Action', emoji: '💥' },
  { id: 'mv_comedy', label: 'Comedy', emoji: '🤣' },
  { id: 'mv_horror', label: 'Horror', emoji: '👻' },
  { id: 'mv_romance', label: 'Romance', emoji: '💘' },
  { id: 'mv_scifi', label: 'Sci-Fi', emoji: '🌌' },
  { id: 'mv_anim', label: 'Animation', emoji: '🎨' },
  { id: 'mv_thriller', label: 'Thriller', emoji: '😱' },
  { id: 'mv_drama', label: 'Drama', emoji: '🎬' },
];

const INDOOR: WheelTopicSegment[] = [
  { id: 'in_board', label: 'Board games', emoji: '🎲' },
  { id: 'in_movie', label: 'Movie night', emoji: '🍿' },
  { id: 'in_cook', label: 'Cook together', emoji: '👨‍🍳' },
  { id: 'in_games', label: 'Video games', emoji: '🎮' },
  { id: 'in_puzzle', label: 'Puzzle', emoji: '🧩' },
  { id: 'in_craft', label: 'Crafts', emoji: '🎨' },
  { id: 'in_karaoke', label: 'Karaoke', emoji: '🎤' },
  { id: 'in_read', label: 'Reading', emoji: '📚' },
];

const OUTDOOR: WheelTopicSegment[] = [
  { id: 'out_hike', label: 'Hike', emoji: '🥾' },
  { id: 'out_beach', label: 'Beach', emoji: '🏖️' },
  { id: 'out_picnic', label: 'Picnic', emoji: '🧺' },
  { id: 'out_bike', label: 'Bike ride', emoji: '🚴' },
  { id: 'out_park', label: 'Park', emoji: '🌳' },
  { id: 'out_sports', label: 'Sports', emoji: '⚽' },
  { id: 'out_market', label: 'Market', emoji: '🛍️' },
  { id: 'out_stars', label: 'Stargaze', emoji: '✨' },
];

export const WHEEL_TOPICS: WheelTopic[] = [
  {
    id: 'eat',
    label: 'Eat',
    emoji: '🍽️',
    question: 'What should we eat?',
    variations: [
      {
        id: 'breakfast',
        label: 'Breakfast',
        emoji: '☀️',
        question: 'Breakfast idea?',
        segments: BREAKFAST,
      },
      {
        id: 'lunch',
        label: 'Lunch',
        emoji: '🌤️',
        question: 'Lunch idea?',
        segments: LUNCH,
      },
      {
        id: 'dinner',
        label: 'Dinner',
        emoji: '🌙',
        question: 'Dinner idea?',
        segments: DINNER,
      },
    ],
  },
  {
    id: 'watch',
    label: 'Watch',
    emoji: '🍿',
    question: 'What should we watch?',
    variations: [
      {
        id: 'tv',
        label: 'TV',
        emoji: '📺',
        question: 'TV vibe?',
        segments: TV,
      },
      {
        id: 'movie',
        label: 'Movie',
        emoji: '🎬',
        question: 'Movie genre?',
        segments: MOVIE,
      },
    ],
  },
  {
    id: 'do',
    label: 'Do',
    emoji: '🎯',
    question: 'What should we do?',
    variations: [
      {
        id: 'indoor',
        label: 'Indoor',
        emoji: '🏠',
        question: 'Indoor plan?',
        segments: INDOOR,
      },
      {
        id: 'outdoor',
        label: 'Outdoor',
        emoji: '🌳',
        question: 'Outdoor plan?',
        segments: OUTDOOR,
      },
    ],
  },
];

export function getTopic(id: WheelTopicId): WheelTopic {
  return WHEEL_TOPICS.find((t) => t.id === id) ?? WHEEL_TOPICS[0];
}

export function getVariation(
  topicId: WheelTopicId,
  variationId: WheelVariationId,
): WheelVariation {
  const topic = getTopic(topicId);
  return (
    topic.variations.find((v) => v.id === variationId) ?? topic.variations[0]
  );
}
