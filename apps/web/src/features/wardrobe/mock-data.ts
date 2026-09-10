export type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  color: string;
  imageUrl: string;
};

// 14 realistic items — enough to exercise the grid and filters without
// pretending we have a full wardrobe. Photos are from Unsplash.
export const MOCK_WARDROBE_ITEMS: WardrobeItem[] = [
  {
    id: 'itm_1',
    name: 'Navy Blazer',
    category: 'Outerwear',
    color: 'Navy',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_2',
    name: 'White Oxford Shirt',
    category: 'Tops',
    color: 'White',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_3',
    name: 'Light Blue Shirt',
    category: 'Tops',
    color: 'Light blue',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_4',
    name: 'Charcoal Trousers',
    category: 'Bottoms',
    color: 'Charcoal',
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_5',
    name: 'Beige Chinos',
    category: 'Bottoms',
    color: 'Beige',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_6',
    name: 'Dark Wash Jeans',
    category: 'Bottoms',
    color: 'Indigo',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_7',
    name: 'Grey Crew Neck',
    category: 'Tops',
    color: 'Grey',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_8',
    name: 'Black Turtleneck',
    category: 'Tops',
    color: 'Black',
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_9',
    name: 'Brown Leather Oxfords',
    category: 'Footwear',
    color: 'Brown',
    imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_10',
    name: 'White Sneakers',
    category: 'Footwear',
    color: 'White',
    imageUrl: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_11',
    name: 'Charcoal Suit Jacket',
    category: 'Outerwear',
    color: 'Charcoal',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_12',
    name: 'Navy Knit Tie',
    category: 'Accessories',
    color: 'Navy',
    imageUrl: 'https://images.unsplash.com/photo-1614251055880-ee96e4803393?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_13',
    name: 'Brown Leather Belt',
    category: 'Accessories',
    color: 'Brown',
    imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=300&h=300&fit=crop',
  },
  {
    id: 'itm_14',
    name: 'Camel Overcoat',
    category: 'Outerwear',
    color: 'Camel',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=300&fit=crop',
  },
];
