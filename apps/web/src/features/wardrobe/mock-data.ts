export type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  color: string;
  imageUrl: string;
};

export const MOCK_WARDROBE_ITEMS: WardrobeItem[] = Array.from({ length: 300 }, (_, index) => ({
  id: `item-${index + 1}`,
  name: `Wardrobe Item ${index + 1}`,
  category: ['T-Shirt', 'Shirt', 'Jeans', 'Jacket', 'Dress'][index % 5],
  color: ['Black', 'White', 'Blue', 'Red', 'Green'][index % 5],
  imageUrl: `https://picsum.photos/seed/${index + 1}/300/300`,
}));
