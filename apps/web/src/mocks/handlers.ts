import { http, HttpResponse } from 'msw';

import { MOCK_SAVED_LOOKS, MOCK_WEAR_EVENTS } from '../features/planner/mock-data';
import { MOCK_WARDROBE_ITEMS } from '../features/wardrobe/mock-data';

// All mocked API responses live here.
// Backend is pending, so frontend API responses are handled by MSW for now.
// Item data comes from the feature mock-data files so it stays in one place.

const BASE = '*/v1';

// Reused across the recommendation looks so the images match the wardrobe.
const [blazer, whiteShirt, trousers] = MOCK_WARDROBE_ITEMS;

function lookItem(item: (typeof MOCK_WARDROBE_ITEMS)[number]) {
  return {
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl,
  };
}

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
  http.post(`${BASE}/recommendations`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    return HttpResponse.json({
      id: crypto.randomUUID(),
      status: 'created',
      ...body,
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
          items: [lookItem(blazer), lookItem(whiteShirt), lookItem(trousers)],
          scores: {
            color: 9,
            occasion: 9,
            compatibility: 8,
          },
          explanation:
            'The navy blazer, white shirt and grey trousers create a balanced combination for the selected occasion.',
        },
        {
          id: 'look_balanced',
          label: 'Balanced',
          overallScore: 89,
          items: [lookItem(whiteShirt), lookItem(trousers), lookItem(blazer)],
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
          items: [lookItem(blazer), lookItem(trousers), lookItem(whiteShirt)],
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

  // POST /v1/recommendations/:id/refine
  http.post(`${BASE}/recommendations/:id/refine`, async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      lookId?: string;
      action?: 'refine' | 'substitute';
    };

    return HttpResponse.json({
      id: params.id,
      status: 'complete',
      lookId: body.lookId,
      action: body.action,
      message:
        body.action === 'substitute'
          ? 'Substitution applied to this look.'
          : 'Refinement applied to this look.',
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

  // GET /v1/billing
  http.get(`${BASE}/billing`, () => {
    return HttpResponse.json({
      plan: 'Free',
      quota: {
        used: 2,
        limit: 5,
        remaining: 3,
        period: 'this month',
      },
    });
  }),

  // POST /v1/billing/checkout
  http.post(`${BASE}/billing/checkout`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      plan?: string;
    };

    if (body.plan !== 'pro') {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_PLAN',
            message: 'The selected plan is not available.',
            correlation_id: crypto.randomUUID(),
            retryable: false,
          },
        },
        { status: 422 },
      );
    }

    return HttpResponse.json({
      status: 'success',
      plan: 'Pro',
      checkoutUrl: 'https://mock-checkout.local/session',
    });
  }),
  // POST /v1/tryon/requests
  http.post(`${BASE}/tryon/requests`, () => {
    return HttpResponse.json({
      id: crypto.randomUUID(),
      status: 'completed',
      imageUrl: MOCK_WARDROBE_ITEMS[0].imageUrl,
      quotaRemaining: 2,
      quotaTotal: 5,
    });
  }),

  // GET /v1/tryon/requests/:id
  http.get(`${BASE}/tryon/requests/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'completed',
      imageUrl: MOCK_WARDROBE_ITEMS[0].imageUrl,
      quotaRemaining: 2,
      quotaTotal: 5,
    });
  }),

  // GET /v1/me
  http.get(`${BASE}/me`, () => {
    return HttpResponse.json({
      id: 'usr_1',
      name: 'Atharv Pratap Singh',
      email: 'atharv@labdox.in',
      createdAt: '2026-08-10T00:00:00.000Z',
    });
  }),

  // DELETE /v1/me
  http.delete(`${BASE}/me`, () => {
    return HttpResponse.json({
      status: 'scheduled',
      deletesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  // GET /v1/consents
  http.get(`${BASE}/consents`, () => {
    return HttpResponse.json({
      wardrobeProcessing: true,
      personalization: true,
      tryOn: false,
      analytics: false,
    });
  }),

  // PATCH /v1/consents
  http.patch(`${BASE}/consents`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, boolean>;

    return HttpResponse.json(body);
  }),

  // POST /v1/privacy/exports
  http.post(`${BASE}/privacy/exports`, () => {
    return HttpResponse.json({
      id: crypto.randomUUID(),
      status: 'preparing',
      requestedAt: new Date().toISOString(),
    });
  }),

  // GET /v1/insights
  http.get(`${BASE}/insights`, () => {
    return HttpResponse.json({
      totalItems: MOCK_WARDROBE_ITEMS.length,
      itemsWornThisMonth: 8,
      neverWorn: 3,
      mostWorn: { name: blazer.name, timesWorn: 6 },
      byCategory: [
        { category: 'Tops', count: 4 },
        { category: 'Bottoms', count: 3 },
        { category: 'Outerwear', count: 3 },
        { category: 'Footwear', count: 2 },
        { category: 'Accessories', count: 2 },
      ],
    });
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
//         details: { retryable: false },
//       },
//     },
//     { status: 422 },
//   );
// });

// Insufficient wardrobe on recommendations:
//
// http.post(`${BASE}/recommendations`, () => {
//   return HttpResponse.json(
//     {
//       error: {
//         code: 'INSUFFICIENT_WARDROBE',
//         message: 'Not enough items to build a look for this occasion.',
//         correlation_id: crypto.randomUUID(),
//         details: { retryable: false },
//       },
//     },
//     { status: 422 },
//   );
// });

// Try-on quota exceeded:
//
// http.post(`${BASE}/tryon/requests`, () => {
//   return HttpResponse.json(
//     {
//       error: {
//         code: 'QUOTA_EXCEEDED',
//         message: 'You have used all your try-ons for this month.',
//         correlation_id: crypto.randomUUID(),
//         details: { retryable: false },
//       },
//     },
//     { status: 429 },
//   );
// });

// Empty wardrobe:
//
// http.get(`${BASE}/wardrobe/items`, () => {
//   return HttpResponse.json({ items: [] });
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
//         details: { retryable: true },
//       },
//     },
//     { status: 500 },
//   );
// });
