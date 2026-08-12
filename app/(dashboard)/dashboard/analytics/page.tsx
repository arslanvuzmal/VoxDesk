'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface AnalyticsMetrics {
  totalConversations: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  appointmentsBooked: number;
  opportunitiesCreated: number;
  appointmentRate: number | null;
  opportunityStages: Record<string, number>;
}

interface AnalyticsResponse {
  data?: AnalyticsMetrics;
  error?: {
    code: string;
    message: string;
    correlationId?: string;
  };
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics', {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      const payload = (await response.json()) as AnalyticsResponse;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message || 'Analytics data is unavailable.');
      }

      setMetrics(payload.data);
    } catch (fetchError) {
      setMetrics(null);
      setError(fetchError instanceof Error ? fetchError.message : 'Analytics data is unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const stageRows = Object.entries(metrics?.opportunityStages || {}).sort(
    ([firstStage], [secondStage]) => firstStage.localeCompare(secondStage)
  );

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            Insight
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F172A]">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Calculated from persisted conversations and confirmed CRM records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchAnalytics()}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            aria-hidden="true"
            className={`h-4 w-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`}
          />
          Refresh
        </button>
      </header>

      <div aria-live="polite">
        {loading ? (
          <section className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center">
            <p className="text-sm text-[#64748B]">Calculating analytics from stored records…</p>
          </section>
        ) : error || !metrics ? (
          <section className="rounded-lg border border-[#F59E0B]/40 bg-[#FFFBEB] p-5">
            <h2 className="font-semibold text-[#78350F]">Analytics are unavailable</h2>
            <p className="mt-1 text-sm text-[#92400E]">
              {error || 'The analytics service did not return a valid result.'}
            </p>
          </section>
        ) : (
          <div className="space-y-6">
            <section
              aria-label="Conversation analytics"
              className="grid overflow-hidden rounded-lg border border-[#E2E8F0] bg-white sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                ['Conversations', metrics.totalConversations.toLocaleString()],
                ['Appointments', metrics.appointmentsBooked.toLocaleString()],
                ['Opportunities', metrics.opportunitiesCreated.toLocaleString()],
                ['Average duration', formatDuration(metrics.averageDurationSeconds)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-b border-r border-[#E2E8F0] p-4 last:border-r-0 lg:border-b-0"
                >
                  <p className="text-xs text-[#64748B]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#0F172A]">{value}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
              <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
                <h2 className="font-semibold text-[#0F172A]">Confirmed outcomes</h2>
                <dl className="mt-5 divide-y divide-[#E2E8F0] text-sm">
                  <div className="flex min-h-12 items-center justify-between gap-4">
                    <dt className="text-[#64748B]">Appointment rate</dt>
                    <dd className="font-semibold text-[#0F172A]">
                      {metrics.appointmentRate === null
                        ? 'Not provided'
                        : `${metrics.appointmentRate}%`}
                    </dd>
                  </div>
                  <div className="flex min-h-12 items-center justify-between gap-4">
                    <dt className="text-[#64748B]">Total conversation time</dt>
                    <dd className="font-semibold text-[#0F172A]">
                      {formatDuration(metrics.totalDurationSeconds)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-[#E2E8F0] bg-white">
                <div className="border-b border-[#E2E8F0] p-5">
                  <h2 className="font-semibold text-[#0F172A]">Opportunity stages</h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Current persisted opportunity records by stage.
                  </p>
                </div>
                {stageRows.length === 0 ? (
                  <p className="p-5 text-sm text-[#64748B]">
                    No opportunities have been created yet.
                  </p>
                ) : (
                  <dl className="divide-y divide-[#E2E8F0]">
                    {stageRows.map(([stage, count]) => (
                      <div
                        key={stage}
                        className="flex min-h-12 items-center justify-between gap-4 px-5 text-sm"
                      >
                        <dt className="text-[#475569]">{stage.replaceAll('_', ' ')}</dt>
                        <dd className="font-semibold text-[#0F172A]">{count}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
