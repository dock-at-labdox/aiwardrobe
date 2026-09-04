// Fetches the Auth0 access token from our own API route.
// Cached briefly so screens making several calls don't hit it every time.
let cached: { token: string; at: number } | null = null;
const CACHE_MS = 60_000;

export async function getToken(): Promise<string | undefined> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.token;
  }

  try {
    const response = await fetch('/api/token');

    if (!response.ok) return undefined;

    const data = (await response.json()) as { token: string | null };

    if (!data.token) return undefined;

    cached = { token: data.token, at: Date.now() };

    return data.token;
  } catch {
    return undefined;
  }
}
