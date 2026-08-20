'use client';

import { useState, type FormEvent } from 'react';

export default function SignInForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);

    try {
      // OIDC provider is not decided yet.
      // Real authentication will be connected later.

      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log('Sign in:', { email });
    } catch {
      setError('Sign-in failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Sign in</h1>

        <p className="mt-2 text-gray-600">Sign in to continue to AI Wardrobe.</p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="/sign-up" className="font-medium text-black underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
