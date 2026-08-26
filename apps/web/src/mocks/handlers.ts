import { http, HttpResponse } from 'msw';

import { MOCK_WARDROBE_ITEMS } from '../features/wardrobe/mock-data';
import { MOCK_SAVED_LOOKS, MOCK_WEAR_EVENTS } from '../features/planner/mock-data';

// All mocked API responses live here.
// Backend is pending, so frontend API responses are handled by MSW for now.

const BASE = '*/v1';

export const handlers = [
  // GET /v1/wardrobe/items
  http.get(`${BASE}/wardrobe/items`, () => {
    return HttpResponse.json({
      items: MOCK_WARDROBE_ITEMS,
    });
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

  // POST /v1/recommendations
  // Backend is pending, so recommendations are mocked with MSW for now.
  http.post(`${BASE}/recommendations`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      id: crypto.randomUUID(),
      status: 'created',
      ...body,
    });
  }),
  // GET /v1/planner/looks
  http.get(`${BASE}/planner/looks`, () => {
    return HttpResponse.json({
      looks: MOCK_SAVED_LOOKS,
    });
  }),

  // GET /v1/planner/wear-history
  http.get(`${BASE}/planner/wear-history`, () => {
    return HttpResponse.json({
      events: MOCK_WEAR_EVENTS,
    });
  }),
  // POST /v1/planner/looks/:id/worn
  http.post(`${BASE}/planner/looks/:id/worn`, ({ params }) => {
    const savedLook = MOCK_SAVED_LOOKS.find((look) => look.id === params.id);

    if (!savedLook) {
      return HttpResponse.json(
        {
          error: {
            code: 'SAVED_LOOK_NOT_FOUND',
            message: 'We could not find this saved look.',
            correlation_id: crypto.randomUUID(),
          },
        },
        { status: 404 },
      );
    }

    const wearEvent = {
      id: crypto.randomUUID(),
      savedLookId: savedLook.id,
      wornAt: new Date().toISOString().slice(0, 10),
    };

    return HttpResponse.json(wearEvent, { status: 201 });
  }),
];

// -----------------------------------------------------------------------------
// Error examples
// Copy one of these into `handlers` above or use `server.use(...)` in a test.
// -----------------------------------------------------------------------------

// Low colour confidence:
//
// http.post(`${BASE}/color/analyze`, () => {
//   return HttpResponse.json(
//     {
//       error: {
//         code: 'COLOR_LOW_CONFIDENCE',
//         message: 'We could not confidently identify the colour.',
//         correlation_id: crypto.randomUUID(),
//         details: {
//           retryable: false,
//         },
//       },
//     },
//     { status: 422 },
//   );
// });

// Empty wardrobe:
//
// http.get(`${BASE}/wardrobe/items`, () => {
//   return HttpResponse.json({
//     items: [],
//   });
// });

// Server error:
//
// http.get(`${BASE}/wardrobe/items`, () => {
//   return HttpResponse.json(
//     {
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Something went wrong on our side.',
//         correlation_id: crypto.randomUUID(),
//         details: {
//           retryable: true,
//         },
//       },
//     },
//     { status: 500 },
//   );
// });
