import { redirect } from 'next/navigation';

import { auth0 } from '@/lib/auth0';

export default async function IndexPage() {
  const session = await auth0.getSession();

  // Logged-in users go straight to their wardrobe, everyone else sees the pitch.
  redirect(session ? '/wardrobe' : '/welcome');
}
