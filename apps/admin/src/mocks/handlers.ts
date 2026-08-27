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
];
