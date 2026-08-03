import { Settings, Clock, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Business Settings & Opening Hours
        </h1>
        <p className="text-sm text-gray-400">
          Configure business timezone, opening hours, holiday rules, and
          encrypted escalation numbers.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
        <div className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-gray-300 mb-1">
              Business Name
            </label>
            <input
              type="text"
              defaultValue="Northstar Legal Consultations"
              className="w-full max-w-md p-3 rounded-xl bg-gray-950 border border-gray-800 text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-300 mb-1">
              Timezone
            </label>
            <input
              type="text"
              defaultValue="America/New_York (EST)"
              className="w-full max-w-md p-3 rounded-xl bg-gray-950 border border-gray-800 text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-300 mb-1">
              Default Opening Hours
            </label>
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-900 text-xs font-mono space-y-1 max-w-md">
              <p>Monday - Friday: 09:00 AM - 05:00 PM EST</p>
              <p>Saturday - Sunday: Closed (After-Hours Agent Active)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
