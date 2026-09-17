/** Cached item_payload seeds — dinner / activity picks for swipe match. */

export type CatalogItem = {
  id: string;
  type: 'food' | 'activity' | 'movie' | 'custom';
  title: string;
  subtitle?: string;
  emoji: string;
  tags?: string[];
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

export function buildSwipeDeck(items: CatalogItem[] = DINNER_ITEMS) {
  return items.map((item, order) => ({
    id: item.id,
    order,
    payload: item,
  }));
}
