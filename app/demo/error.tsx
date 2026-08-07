'use client';

import { useEffect } from 'react';

export default function DemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[VOXDESK_DEMO_CLIENT_ERROR]', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl">
        <p className="text-xs font-mono uppercase tracking-wider text-rose-400">
          Voice demo failed to initialize
        </p>

        <h1 className="mt-2 text-2xl font-bold text-white">
          VoxDesk could not load the realtime voice client.
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Reload the voice module. If the problem continues, the production logs and browser console
          must be inspected before retrying.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          Reload Voice Demo
        </button>
      </section>
    </main>
  );
}
