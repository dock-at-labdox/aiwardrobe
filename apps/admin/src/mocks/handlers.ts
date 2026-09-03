import { http, HttpResponse } from 'msw';

const BASE = '*/v1';

export const handlers = [
  http.get(`${BASE}/admin/support/users`, () => {
    return HttpResponse.json({
      users: [
        {
          id: 'usr_001',
          email: 'operator@example.com',
        },
        {
          id: 'usr_002',
          email: 'customer@example.com',
        },
      ],
    });
  }),
  http.get(`${BASE}/admin/moderation/queue`, () => {
    return HttpResponse.json({
      items: [
        {
          id: 'mod_001',
          type: 'Wardrobe Item',
          status: 'PENDING',
          description: 'Item awaiting moderation review.',
        },
        {
          id: 'mod_002',
          type: 'User Content',
          status: 'FLAGGED',
          description: 'Content flagged for operational review.',
        },
      ],
    });
  }),
  http.get(`${BASE}/admin/reports/overview`, () => {
    return HttpResponse.json({
      totalUsers: 124,
      wardrobeItems: 486,
      recommendations: 312,
      moderationPending: 7,
    });
  }),
  http.get(`${BASE}/admin/reports/overview`, () => {
    return HttpResponse.json({
      totalUsers: 128,
      activeUsers: 96,
      wardrobeItems: 742,
      moderationPending: 7,
    });
  }),
];
