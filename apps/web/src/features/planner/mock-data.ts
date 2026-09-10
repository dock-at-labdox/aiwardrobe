export type SavedLook = {
  id: string;
  title: string;
  status: 'SAVED' | 'SCHEDULED' | 'ARCHIVED';
  createdAt: string;
  itemIds: string[];
};

export type WearEvent = {
  id: string;
  savedLookId: string;
  wornAt: string;
  audienceKey?: string;
  rating?: number;
  notes?: string;
};

export const MOCK_SAVED_LOOKS: SavedLook[] = [
  {
    id: 'look-1',
    title: 'Smart Office Look',
    status: 'SAVED',
    createdAt: '2026-08-20T10:00:00.000Z',
    itemIds: ['item-1', 'item-2', 'item-3'],
  },
  {
    id: 'look-2',
    title: 'Client Meeting Look',
    status: 'SAVED',
    createdAt: '2026-08-22T10:00:00.000Z',
    itemIds: ['item-4', 'item-5', 'item-6'],
  },
  {
    id: 'look-3',
    title: 'Presentation Look',
    status: 'SCHEDULED',
    createdAt: '2026-08-24T10:00:00.000Z',
    itemIds: ['item-7', 'item-8', 'item-9'],
  },
];

export const MOCK_WEAR_EVENTS: WearEvent[] = [
  {
    id: 'wear-1',
    savedLookId: 'look-1',
    wornAt: '2026-08-21',
    audienceKey: 'office',
    rating: 5,
    notes: 'Comfortable and professional.',
  },
  {
    id: 'wear-2',
    savedLookId: 'look-2',
    wornAt: '2026-08-23',
    audienceKey: 'client',
    rating: 4,
    notes: 'Good for the meeting.',
  },
];
