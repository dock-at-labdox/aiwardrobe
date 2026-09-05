'use client';

import { useEffect, useState } from 'react';
import { Download, Trash2, AlertTriangle } from 'lucide-react';

import { ApiClient, AsyncState, type ErrorEnvelope } from '@aiwardrobe/shared-web';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getToken } from '@/lib/get-token';

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type Consents = {
  wardrobeProcessing: boolean;
  personalization: boolean;
  tryOn: boolean;
  analytics: boolean;
};

const CONSENT_ITEMS: { key: keyof Consents; title: string; description: string }[] = [
  {
    key: 'wardrobeProcessing',
    title: 'Wardrobe processing',
    description: 'Process your garment photos to identify colours and build your wardrobe.',
  },
  {
    key: 'personalization',
    title: 'Personalization',
    description: 'Use your preferences and wear history to tailor recommendations.',
  },
  {
    key: 'tryOn',
    title: 'Try-on',
    description: 'Process your photo to preview looks on you. Turn this off any time.',
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'Share usage data to help improve the product.',
  },
];

const apiClient = new ApiClient(undefined, { tokenProvider: getToken });

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [consents, setConsents] = useState<Consents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEnvelope | null>(null);

  const [savingConsent, setSavingConsent] = useState<keyof Consents | null>(null);
  const [consentError, setConsentError] = useState('');

  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    Promise.all([apiClient.get<User>('/v1/me'), apiClient.get<Consents>('/v1/consents')])
      .then(([userResponse, consentResponse]) => {
        setUser(userResponse);
        setConsents(consentResponse);
        setError(null);
      })
      .catch((err) => {
        setError(err as ErrorEnvelope);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function toggleConsent(key: keyof Consents) {
    if (!consents) return;

    const next = { ...consents, [key]: !consents[key] };

    setSavingConsent(key);
    setConsentError('');
    setConsents(next);

    try {
      await apiClient.patch<Consents>('/v1/consents', { [key]: next[key] });
    } catch (err) {
      // Put it back so the screen never claims something we failed to save.
      setConsents(consents);

      const envelope = err as ErrorEnvelope;
      setConsentError(
        envelope.error?.message ?? 'Could not update that setting. Please try again.',
      );
    } finally {
      setSavingConsent(null);
    }
  }

  async function handleExport() {
    setExporting(true);
    setExportMessage('');

    try {
      await apiClient.post('/v1/privacy/exports', {}, { idempotencyKey: crypto.randomUUID() });
      setExportMessage(
        'We are preparing your export. You will get a download link by email when it is ready.',
      );
    } catch (err) {
      const envelope = err as ErrorEnvelope;
      setExportMessage(envelope.error?.message ?? 'Could not start the export. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteMessage('');

    try {
      await apiClient.delete('/v1/me');
      setDeleteMessage(
        'Your account is scheduled for deletion. You can sign in within 30 days to cancel it.',
      );
      setConfirmingDelete(false);
    } catch (err) {
      const envelope = err as ErrorEnvelope;
      setDeleteMessage(
        envelope.error?.message ?? 'Could not delete your account. Please try again.',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile &amp; settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account, what we process, and your data.
        </p>
      </header>

      <AsyncState
        loading={loading}
        error={error}
        loadingMessage="Loading your profile..."
        emptyMessage="We could not load your profile."
      >
        {user && consents && (
          <div className="space-y-8">
            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Account</h2>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{user.name}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{user.email}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Member since</dt>
                  <dd className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">What we process</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Each one is separate. Turning any of them off does not affect the others.
              </p>

              {consentError && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {consentError}
                </p>
              )}

              <div className="mt-4 space-y-3">
                {CONSENT_ITEMS.map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-4"
                  >
                    <Checkbox
                      checked={consents[item.key]}
                      onCheckedChange={() => toggleConsent(item.key)}
                      disabled={savingConsent === item.key}
                      className="mt-0.5"
                    />

                    <div>
                      <p className="text-sm font-medium">
                        {item.title}
                        {savingConsent === item.key && (
                          <span className="ml-2 text-xs text-muted-foreground">Saving...</span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Your data</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your photos and wardrobe are yours. Take them with you or remove them entirely.
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Download className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />

                    <div className="flex-1">
                      <p className="text-sm font-medium">Export your data</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        A copy of your wardrobe, saved looks and wear history.
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleExport}
                        disabled={exporting}
                        className="mt-3"
                      >
                        {exporting ? 'Requesting...' : 'Request export'}
                      </Button>

                      {exportMessage && (
                        <p role="status" className="mt-3 text-sm text-muted-foreground">
                          {exportMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-destructive/30 p-4">
                  <div className="flex items-start gap-3">
                    <Trash2
                      className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                      aria-hidden="true"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-medium">Delete your account</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Removes your account and everything in it.
                      </p>

                      {!confirmingDelete ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setConfirmingDelete(true)}
                          className="mt-3"
                        >
                          Delete account
                        </Button>
                      ) : (
                        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle
                              className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                              aria-hidden="true"
                            />

                            <div>
                              <p className="text-sm font-medium text-destructive">
                                Delete your account?
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Your wardrobe, saved looks and photos will be removed. You have 30
                                days to change your mind before it is permanent.
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setConfirmingDelete(false)}
                              disabled={deleting}
                            >
                              Keep my account
                            </Button>

                            <Button
                              type="button"
                              variant="destructive"
                              onClick={handleDelete}
                              disabled={deleting}
                            >
                              {deleting ? 'Deleting...' : 'Yes, delete it'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {deleteMessage && (
                        <p role="status" className="mt-3 text-sm text-muted-foreground">
                          {deleteMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </AsyncState>
    </div>
  );
}
