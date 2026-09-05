import { NextResponse } from 'next/server';

import { auth0 } from '@/lib/auth0';

// The access token lives in an encrypted server-side session cookie.
// This route hands it to the browser so ApiClient can attach it.
export async function GET() {
  try {
    const { token } = await auth0.getAccessToken();
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ token: null }, { status: 401 });
  }
}
