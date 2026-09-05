'use client';

import { useEffect, useState } from 'react';

import { ApiClient, AsyncState, type ErrorEnvelope } from '@aiwardrobe/shared-web';

import { Button } from '@/components/ui/button';

type BillingData = {
  plan: string;
  quota: {
    used: number;
    limit: number;
    remaining: number;
    period: string;
  };
};

type CheckoutResponse = {
  status: 'success' | 'pending';
  plan: string;
  checkoutUrl?: string;
};

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    description: 'For getting started',
    features: ['50 wardrobe items', '5 AI try-ons/month', 'Basic recommendations'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹499',
    description: 'For regular users',
    features: ['Unlimited wardrobe items', '50 AI try-ons/month', 'Advanced recommendations'],
  },
];

export default function Billing() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<ErrorEnvelope | null>(null);
  const [checkoutError, setCheckoutError] = useState<ErrorEnvelope | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const loadBilling = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiClient = new ApiClient();
        const response = await apiClient.get<BillingData>('/v1/billing');

        setBilling(response);
      } catch (requestError) {
        setError(requestError as ErrorEnvelope);
      } finally {
        setLoading(false);
      }
    };

    void loadBilling();
  }, []);

  const handleCheckout = async (planId: string) => {
    if (planId === 'free' || billing?.plan === 'Pro') {
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutSuccess(false);

    try {
      const apiClient = new ApiClient();

      const response = await apiClient.post<CheckoutResponse>('/v1/billing/checkout', {
        plan: planId,
      });

      setBilling((current) =>
        current
          ? {
              ...current,
              plan: response.plan,
            }
          : current,
      );

      setCheckoutSuccess(true);

      // The mock API returns a checkout URL.
      // Keep the user on the billing screen for the mocked flow.
      // A real checkout URL can be opened here when payment is integrated.
      if (response.checkoutUrl) {
        console.info('Checkout URL:', response.checkoutUrl);
      }
    } catch (requestError) {
      setCheckoutError(requestError as ErrorEnvelope);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Billing & Subscription</h1>

        <p className="mt-2 text-gray-600">
          Manage your plan and understand your entitlement before using your quota.
        </p>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!billing}
        loadingMessage="Loading your billing information..."
        emptyMessage="Billing information is not available."
      >
        {billing && (
          <>
            <section className="mb-8 rounded-xl border p-6">
              <h2 className="text-xl font-semibold">Current Plan & Quota</h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Current plan</p>

                  <p className="mt-1 text-lg font-medium">{billing.plan}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Try-On quota</p>

                  <p className="mt-1 text-lg font-medium">
                    {billing.quota.remaining} of {billing.quota.limit} remaining{' '}
                    {billing.quota.period}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">{billing.quota.used} used</p>
                </div>
              </div>
            </section>

            {checkoutSuccess && (
              <div role="status" className="mb-8 rounded-xl border p-4">
                <p className="font-medium">Checkout started successfully.</p>

                <p className="mt-1 text-sm text-gray-600">
                  Your plan has been updated to {billing.plan}.
                </p>
              </div>
            )}

            {checkoutError && (
              <div role="alert" className="mb-8 rounded-xl border p-4">
                <p className="font-medium">Checkout could not be started.</p>

                <p className="mt-1 text-sm text-gray-600">
                  {checkoutError.error?.message ?? 'Please try again.'}
                </p>
              </div>
            )}

            <section>
              <h2 className="mb-4 text-xl font-semibold">Choose a Plan</h2>

              <div className="grid gap-6 md:grid-cols-2">
                {plans.map((plan) => {
                  const isCurrent = billing.plan === plan.name;
                  const isPro = plan.id === 'pro';

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-xl border p-6 ${isCurrent ? 'ring-2 ring-black' : ''}`}
                    >
                      <h3 className="text-xl font-semibold">{plan.name}</h3>

                      <p className="mt-2 text-3xl font-bold">{plan.price}</p>

                      <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

                      <ul className="mt-5 space-y-2 text-sm">
                        {plan.features.map((feature) => (
                          <li key={feature}>
                            <span aria-hidden="true">• </span>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        type="button"
                        className="mt-6 w-full"
                        variant={isCurrent ? 'secondary' : 'default'}
                        disabled={isCurrent || checkoutLoading || !isPro}
                        onClick={() => void handleCheckout(plan.id)}
                      >
                        {isCurrent
                          ? 'Current Plan'
                          : checkoutLoading
                            ? 'Starting Checkout...'
                            : 'Upgrade to Pro'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </AsyncState>
    </main>
  );
}
