'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DASHBOARD ERROR]:', error);
  }, [error]);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 text-xs text-[#F4F4F5]">
      <div className="p-6 rounded-xl bg-[#13171C] border border-red-800/60 space-y-4">
        <div className="flex items-start gap-3 text-red-400">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Dashboard Component Error
            </h2>
            <p className="text-xs text-red-200">
              {error.message || 'An unexpected error occurred while loading this dashboard view.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-red-900 hover:bg-red-800 text-white font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-[#171C22] hover:bg-[#202730] text-[#D4D4D8] border border-[#272D35] flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Return to Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
