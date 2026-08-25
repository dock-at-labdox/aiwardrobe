import { http, HttpResponse } from 'msw';

import { MOCK_WARDROBE_ITEMS } from '../features/wardrobe/mock-data';

// All mocked API responses live here. Item data comes from
// features/wardrobe/mock-data.ts so it stays in one place.

const BASE = '*/v1';

export const handlers = [
  // GET /v1/wardrobe/items
  http.get(`${BASE}/wardrobe/items`, () => {
    return HttpResponse.json({ items: MOCK_WARDROBE_ITEMS });
  }),

  // GET /v1/wardrobe/items/:id
  http.get(`${BASE}/wardrobe/items/:id`, ({ params }) => {
    const item = MOCK_WARDROBE_ITEMS.find((wardrobeItem) => wardrobeItem.id === params.id);

    if (!item) {
      return HttpResponse.json(
        {
          error: {
            code: 'WARDROBE_ITEM_NOT_FOUND',
            message: 'We could not find this wardrobe item.',
            correlation_id: crypto.randomUUID(),
          },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(item);
  }),

  // POST /v1/wardrobe/uploads/sessions
  http.post(`${BASE}/wardrobe/uploads/sessions`, () => {
    return HttpResponse.json({
      uploadUrl: 'https://mock-storage.local/upload',
      itemId: crypto.randomUUID(),
    });
  }),

  // POST /v1/color/analyze
  http.post(`${BASE}/color/analyze`, () => {
    return HttpResponse.json({
      proposedColor: 'Navy',
      confidence: 0.92,
    });
  }),

  // GET /v1/style/results/:id
  http.get(`${BASE}/style/results/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'complete',
      looks: [
        {
          id: 'look_safe',
          label: 'Safe',
          overallScore: 86,
          items: [
            {
              id: 'itm_1',
              name: 'Navy Blazer',
              imageUrl: 'https://placehold.co/300x300?text=Blazer',
            },
            {
              id: 'itm_2',
              name: 'White Shirt',
              imageUrl: 'https://placehold.co/300x300?text=Shirt',
            },
            {
              id: 'itm_3',
              name: 'Grey Trousers',
              imageUrl: 'https://placehold.co/300x300?text=Trousers',
            },
          ],
          scores: {
            color: 9,
            occasion: 9,
            compatibility: 8,
          },
          explanation:
            'The navy blazer, white shirt, and grey trousers create a balanced combination for the selected occasion.',
        },
        {
          id: 'look_balanced',
          label: 'Balanced',
          overallScore: 89,
          items: [
            {
              id: 'itm_2',
              name: 'White Shirt',
              imageUrl: 'https://placehold.co/300x300?text=Shirt',
            },
            {
              id: 'itm_3',
              name: 'Grey Trousers',
              imageUrl: 'https://placehold.co/300x300?text=Trousers',
            },
            {
              id: 'itm_1',
              name: 'Navy Blazer',
              imageUrl: 'https://placehold.co/300x300?text=Blazer',
            },
          ],
          scores: {
            color: 9,
            occasion: 8,
            compatibility: 10,
          },
          explanation:
            'The neutral shirt and trousers provide a versatile base while the blazer adds structure.',
        },
        {
          id: 'look_distinctive',
          label: 'Distinctive',
          overallScore: 82,
          items: [
            {
              id: 'itm_1',
              name: 'Navy Blazer',
              imageUrl: 'https://placehold.co/300x300?text=Blazer',
            },
            {
              id: 'itm_3',
              name: 'Grey Trousers',
              imageUrl: 'https://placehold.co/300x300?text=Trousers',
            },
            {
              id: 'itm_2',
              name: 'White Shirt',
              imageUrl: 'https://placehold.co/300x300?text=Shirt',
            },
          ],
          scores: {
            color: 8,
            occasion: 8,
            compatibility: 9,
          },
          explanation:
            'The darker blazer creates a stronger contrast against the lighter pieces while remaining versatile.',
        },
      ],
    });
  }),
];

// Error examples — copy one of these into `handlers` above
// (or use server.use(...) in a test) to see how a screen handles it.
//
// Low colour confidence:
//
// http.post(`${BASE}/color/analyze`, () => {
//   return HttpResponse.json(
//     {
//       error: {
//         code: 'COLOR_LOW_CONFIDENCE',
//         message: 'We could not confidently identify the colour.',
//         correlation_id: crypto.randomUUID(),
//         details: { retryable: false },
//       },
//     },
//     { status: 422 },
//   );
// }),
//
// Empty wardrobe:
//
// http.get(`${BASE}/wardrobe/items`, () => {
//   return HttpResponse.json({ items: [] });
// }),
//
// Server error:
//
// http.get(`${BASE}/wardrobe/items`, () => {
//   return HttpResponse.json(
//     {
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Something went wrong on our side.',
//         correlation_id: crypto.randomUUID(),
//         details: { retryable: true },
//       },
//     },
//     { status: 500 },
//   );
// }),
