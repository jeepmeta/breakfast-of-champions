/**
 * Catalog registry for lobby picker + item_payload seeds.
 * Unified CatalogItem shape for swipe / wheel / bracket.
 */

export type CatalogItem = {
  id: string;
  type: 'food' | 'activity' | 'movie' | 'custom';
  title: string;
  subtitle?: string;
  emoji: string;
  tags?: string[];
};

export type CatalogId = 'dinner' | 'movies' | 'activities' | 'custom';

export type CatalogDef = {
  id: CatalogId;
  label: string;
  emoji: string;
  description: string;
  items: CatalogItem[];
};

export const DINNER_ITEMS: CatalogItem[] = [
  { id: 'food_pizza', type: 'food', title: 'Pizza', subtitle: 'Shareable classic', emoji: '🍕', tags: ['casual'] },
  { id: 'food_sushi', type: 'food', title: 'Sushi', subtitle: 'Fresh rolls', emoji: '🍣', tags: ['fresh'] },
  { id: 'food_tacos', type: 'food', title: 'Tacos', subtitle: 'Street-style', emoji: '🌮', tags: ['quick'] },
  { id: 'food_burger', type: 'food', title: 'Burgers', subtitle: 'Comfort food', emoji: '🍔', tags: ['comfort'] },
  { id: 'food_thai', type: 'food', title: 'Thai', subtitle: 'Curry & noodles', emoji: '🍜', tags: ['spicy'] },
  { id: 'food_italian', type: 'food', title: 'Italian', subtitle: 'Pasta night', emoji: '🍝', tags: ['classic'] },
  { id: 'food_salad', type: 'food', title: 'Salad Bowl', subtitle: 'Light & fresh', emoji: '🥗', tags: ['healthy'] },
  { id: 'food_ramen', type: 'food', title: 'Ramen', subtitle: 'Broth & noodles', emoji: '🍥', tags: ['warm'] },
];

export const MOVIE_ITEMS: CatalogItem[] = [
  { id: 'movie_shawshank', type: 'movie', title: 'Shawshank', subtitle: '1994 · Drama', emoji: '🎬', tags: ['classic'] },
  { id: 'movie_godfather', type: 'movie', title: 'The Godfather', subtitle: '1972 · Crime', emoji: '🔫', tags: ['classic'] },
  { id: 'movie_dark_knight', type: 'movie', title: 'Dark Knight', subtitle: '2008 · Action', emoji: '🦇', tags: ['superhero'] },
  { id: 'movie_lotr', type: 'movie', title: 'Return of the King', subtitle: '2003 · Fantasy', emoji: '💍', tags: ['epic'] },
  { id: 'movie_forrest', type: 'movie', title: 'Forrest Gump', subtitle: '1994 · Drama', emoji: '🏃', tags: ['heartwarming'] },
  { id: 'movie_inception', type: 'movie', title: 'Inception', subtitle: '2010 · Sci-Fi', emoji: '🌀', tags: ['mind-bend'] },
  { id: 'movie_parasite', type: 'movie', title: 'Parasite', subtitle: '2019 · Thriller', emoji: '🏠', tags: ['twist'] },
  { id: 'movie_spirited', type: 'movie', title: 'Spirited Away', subtitle: '2001 · Anime', emoji: '👻', tags: ['fantasy'] },
];

export const ACTIVITY_ITEMS: CatalogItem[] = [
  { id: 'act_hike', type: 'activity', title: 'Hike', subtitle: 'Get outside', emoji: '🥾', tags: ['outdoors'] },
  { id: 'act_boardgames', type: 'activity', title: 'Board games', subtitle: 'Tabletop night', emoji: '🎲', tags: ['home'] },
  { id: 'act_karaoke', type: 'activity', title: 'Karaoke', subtitle: 'Sing it out', emoji: '🎤', tags: ['social'] },
  { id: 'act_museum', type: 'activity', title: 'Museum', subtitle: 'Culture fix', emoji: '🖼️', tags: ['culture'] },
  { id: 'act_beach', type: 'activity', title: 'Beach', subtitle: 'Sand & sun', emoji: '🏖️', tags: ['outdoors'] },
  { id: 'act_cooking', type: 'activity', title: 'Cook together', subtitle: 'Kitchen crew', emoji: '👨‍🍳', tags: ['home'] },
  { id: 'act_arcade', type: 'activity', title: 'Arcade', subtitle: 'High scores', emoji: '🕹️', tags: ['fun'] },
  { id: 'act_picnic', type: 'activity', title: 'Picnic', subtitle: 'Park hang', emoji: '🧺', tags: ['chill'] },
];

export const CATALOGS: CatalogDef[] = [
  {
    id: 'dinner',
    label: 'Dinner',
    emoji: '🍽️',
    description: 'What are we eating?',
    items: DINNER_ITEMS,
  },
  {
    id: 'movies',
    label: 'Movies',
    emoji: '🍿',
    description: 'What are we watching?',
    items: MOVIE_ITEMS,
  },
  {
    id: 'activities',
    label: 'Activities',
    emoji: '🎯',
    description: 'What should we do?',
    items: ACTIVITY_ITEMS,
  },
];

export function getCatalog(id: CatalogId): CatalogDef | undefined {
  return CATALOGS.find((c) => c.id === id);
}

export function getCatalogItems(id: CatalogId): CatalogItem[] {
  return getCatalog(id)?.items ?? DINNER_ITEMS;
}

export function buildSwipeDeck(items: CatalogItem[] = DINNER_ITEMS) {
  return items.map((item, order) => ({
    id: item.id,
    order,
    payload: item,
  }));
}
