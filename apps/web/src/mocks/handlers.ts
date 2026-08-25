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
