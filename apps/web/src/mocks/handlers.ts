import { http, HttpResponse } from 'msw';

// All mocked API responses live here.
// When a real backend endpoint lands, delete its handler below — nothing else changes.

const BASE = '*/v1';

export const handlers = [
  // GET /v1/wardrobe/items
  http.get(`${BASE}/wardrobe/items`, () => {
    return HttpResponse.json({
      items: [
        {
          id: 'itm_1',
          name: 'Navy Blazer',
          category: 'Outerwear',
          color: 'Navy',
          imageUrl: 'https://placehold.co/300x300?text=Blazer',
        },
        {
          id: 'itm_2',
          name: 'White Shirt',
          category: 'Tops',
          color: 'White',
          imageUrl: 'https://placehold.co/300x300?text=Shirt',
        },
        {
          id: 'itm_3',
          name: 'Grey Trousers',
          category: 'Bottoms',
          color: 'Grey',
          imageUrl: 'https://placehold.co/300x300?text=Trousers',
        },
      ],
    });
  }),

  // GET /v1/wardrobe/items/:id
  http.get(`${BASE}/wardrobe/items/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Navy Blazer',
      category: 'Outerwear',
      color: 'Navy',
      colorConfirmed: false,
      imageUrl: 'https://placehold.co/600x600?text=Blazer',
    });
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
