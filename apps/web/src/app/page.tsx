import { redirect } from 'next/navigation';

import { auth0 } from '@/lib/auth0';

export default async function IndexPage() {
  const session = await auth0.getSession();

  // After signing in, users start at consent and move through onboarding
  // before the wardrobe. Once the backend can tell us whether consent and
  // onboarding are already done, this should skip straight to /wardrobe
  // for returning users.
  redirect(session ? '/consent' : '/welcome');
}
