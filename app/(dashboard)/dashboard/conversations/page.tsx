'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface ConversationRow {
  id: string;
  channel: 'WEB_VOICE' | 'PHONE' | 'WEB_TEXT';
  direction: 'INBOUND' | 'OUTBOUND' | 'INTERACTIVE';
  status: string;
  intent: string | null;
  outcome: string | null;
  languageCode: string | null;
  startedAt: string;
  durationSeconds: number | null;
  requiresReview: boolean;
  call: {
    provider: string;
    executionMode: 'SIMULATION' | 'LIVE';
    simulationScenario: string | null;
  } | null;
  contact: { name: string; company: string | null } | null;
  agent: { name: string } | null;
}

type Filter = 'ALL' | 'LIVE' | 'INBOUND' | 'OUTBOUND' | 'WEB_VOICE' | 'WEB_TEXT' | 'REVIEW';

export default function ConversationsPage() {
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/conversations', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || 'Conversations are unavailable.');
      setRows(payload.data || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Conversations are unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void load(), [load]);

  const filtered = rows.filter(row => {
    if (filter === 'LIVE')
      return ['CREATED', 'QUEUED', 'CONNECTING', 'ACTIVE', 'HUMAN_HANDOFF'].includes(row.status);
    if (filter === 'INBOUND' || filter === 'OUTBOUND') return row.direction === filter;
    if (filter === 'WEB_VOICE' || filter === 'WEB_TEXT') return row.channel === filter;
    if (filter === 'REVIEW') return row.requiresReview;
    return true;
  });

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#0F172A]">Conversations</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Phone, website voice, and text conversations in one operational record.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="min-h-11 px-3 rounded-md bg-white border border-[#CBD5E1] text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`}
          />{' '}
          Refresh
        </button>
      </header>

      <div className="flex gap-1 overflow-x-auto" aria-label="Conversation filters">
        {(
          ['ALL', 'LIVE', 'INBOUND', 'OUTBOUND', 'WEB_VOICE', 'WEB_TEXT', 'REVIEW'] as Filter[]
        ).map(value => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`min-h-11 shrink-0 px-3 rounded-md text-xs font-semibold ${filter === value ? 'bg-[#0F172A] text-white' : 'bg-white border border-[#E2E8F0] text-[#475569]'}`}
          >
            {value.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-white border border-[#E2E8F0] overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
            <tr>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Direction / channel</th>
              <th className="px-4 py-3">Execution</th>
              <th className="px-4 py-3">Intent</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3 text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[#334155]">
            {loading ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-[#64748B]">
                  Loading conversations…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-[#B91C1C]">
                  {error}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-[#64748B]">
                  No conversations yet. New calls and website conversations will appear here.
                </td>
              </tr>
            ) : (
              filtered.map(row => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#0F172A]">
                      {row.contact?.name || 'Unknown caller'}
                    </span>
                    <span className="block text-[#64748B]">
                      {row.contact?.company || 'Not provided'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.direction} · {row.channel.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    {row.call?.executionMode === 'SIMULATION'
                      ? `Simulation${row.call.simulationScenario ? ` · ${row.call.simulationScenario}` : ''}`
                      : row.call
                        ? 'Live provider'
                        : 'Not provided'}
                  </td>
                  <td className="px-4 py-3">{row.intent || 'Not provided'}</td>
                  <td className="px-4 py-3">
                    {row.status}
                    {row.requiresReview ? ' · Review' : ''}
                  </td>
                  <td className="px-4 py-3">{row.languageCode || 'Not provided'}</td>
                  <td className="px-4 py-3">{row.agent?.name || 'Not assigned'}</td>
                  <td className="px-4 py-3">
                    <time dateTime={row.startedAt}>{new Date(row.startedAt).toLocaleString()}</time>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.durationSeconds == null ? 'No duration' : `${row.durationSeconds}s`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
