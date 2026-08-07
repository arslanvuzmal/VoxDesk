'use client';

import { useState } from 'react';
import { Sliders, TrendingUp, Clock, Users, DollarSign, Calendar, Info } from 'lucide-react';

export function ImpactEstimator() {
  const [monthlyCalls, setMonthlyCalls] = useState(250);
  const [unansweredPct, setUnansweredPct] = useState(20);
  const [handlingMins, setHandlingMins] = useState(6);
  const [dealValue, setDealValue] = useState(500);
  const [bookingPct, setBookingPct] = useState(35);

  // Calculated metrics
  const missedCalls = Math.round(monthlyCalls * (unansweredPct / 100));
  const callsHandled = Math.round(monthlyCalls * 0.95);
  const staffHoursSaved = Math.round((callsHandled * handlingMins) / 60);
  const qualifiedEnquiries = Math.round(callsHandled * (bookingPct / 100));
  const potentialValue = qualifiedEnquiries * dealValue;

  return (
    <div className="space-y-8 select-none">
      {/* Prominent Disclaimer Badge */}
      <div className="p-3.5 rounded-lg bg-[#EFF6FF] border border-[#1D4ED8]/20 flex items-center gap-2.5 text-xs text-[#1D4ED8]">
        <Info className="w-4 h-4 shrink-0" />
        <span className="font-semibold">
          Illustrative operational estimate based on your inputs. Not a guarantee of business
          results.
        </span>
      </div>

      {/* Main Grid: Inputs Left, Calculated Outputs Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (1/3): User Controls */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Sliders className="w-4 h-4 text-[#1D4ED8]" />
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Operational Input Parameters
            </h3>
          </div>

          {/* Slider 1: Monthly Calls */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#475569]">Monthly Inbound Calls</span>
              <span className="font-bold font-mono text-[#0F172A]">{monthlyCalls}</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={monthlyCalls}
              onChange={e => setMonthlyCalls(Number(e.target.value))}
              className="w-full accent-[#1D4ED8]"
            />
          </div>

          {/* Slider 2: Unanswered Pct */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#475569]">Unanswered / Missed Pct</span>
              <span className="font-bold font-mono text-[#0F172A]">{unansweredPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={unansweredPct}
              onChange={e => setUnansweredPct(Number(e.target.value))}
              className="w-full accent-[#1D4ED8]"
            />
          </div>

          {/* Slider 3: Handling Time */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#475569]">Handling Time / Call</span>
              <span className="font-bold font-mono text-[#0F172A]">{handlingMins} mins</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={handlingMins}
              onChange={e => setHandlingMins(Number(e.target.value))}
              className="w-full accent-[#1D4ED8]"
            />
          </div>

          {/* Slider 4: Deal Value */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#475569]">Avg Opportunity Value</span>
              <span className="font-bold font-mono text-[#0F172A]">${dealValue}</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={dealValue}
              onChange={e => setDealValue(Number(e.target.value))}
              className="w-full accent-[#1D4ED8]"
            />
          </div>

          {/* Slider 5: Booking Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#475569]">Target Booking Rate</span>
              <span className="font-bold font-mono text-[#0F172A]">{bookingPct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={bookingPct}
              onChange={e => setBookingPct(Number(e.target.value))}
              className="w-full accent-[#1D4ED8]"
            />
          </div>
        </div>

        {/* Right Column (2/3): Metrics & Visual Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 4 Output Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1 shadow-sm">
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                Calls Handled
              </span>
              <p className="text-2xl font-bold text-[#0F172A] font-mono">{callsHandled}</p>
              <p className="text-[11px] text-[#15803D]">95% coverage</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1 shadow-sm">
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                Hours Redirected
              </span>
              <p className="text-2xl font-bold text-[#0F172A] font-mono">{staffHoursSaved}h</p>
              <p className="text-[11px] text-[#64748B]">Monthly team time</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1 shadow-sm">
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                Bookings Captured
              </span>
              <p className="text-2xl font-bold text-[#0F172A] font-mono">{qualifiedEnquiries}</p>
              <p className="text-[11px] text-[#15803D]">Qualified leads</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1 shadow-sm">
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                Pipeline Value
              </span>
              <p className="text-2xl font-bold text-[#1D4ED8] font-mono">
                ${potentialValue.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#64748B]">Est. monthly value</p>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Conversion Funnel */}
            <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                1. Conversation Conversion Funnel
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-[#64748B] mb-1">
                    <span>Inbound Calls Received</span>
                    <span className="font-mono text-[#0F172A]">{monthlyCalls}</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#475569] h-full w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#64748B] mb-1">
                    <span>Automated Answering</span>
                    <span className="font-mono text-[#0F172A]">{callsHandled}</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#1D4ED8] h-full w-[95%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#64748B] mb-1">
                    <span>Qualified & Booked</span>
                    <span className="font-mono text-[#0F172A]">{qualifiedEnquiries}</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#15803D] h-full" style={{ width: `${bookingPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Before vs After Workload */}
            <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                2. Staff Workload Shift
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B]">
                  <p className="font-semibold text-xs">Without VoxDesk:</p>
                  <p className="text-[11px] mt-0.5">
                    {staffHoursSaved} hours spent answering routine questions & manual scheduling.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#86EFAC] text-[#166534]">
                  <p className="font-semibold text-xs">With VoxDesk:</p>
                  <p className="text-[11px] mt-0.5">
                    100% of staff time redirected to complex client work & high-value escalations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
