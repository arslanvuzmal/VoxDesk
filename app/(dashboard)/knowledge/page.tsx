import { BookOpen, Plus } from "lucide-react";

export default function KnowledgePage() {
  const faqs = [
    {
      q: "What practice areas does Northstar Legal specialize in?",
      a: "We specialize in corporate legal counsel, commercial contract reviews, real estate transactions, and litigation defense.",
    },
    {
      q: "What is your consultation fee structure?",
      a: "Initial 30-minute consultations are offered at a flat rate of $150, which is credited toward your retainer if retained.",
    },
    {
      q: "Where are your offices located?",
      a: "Our primary office is located in Manhattan, NYC, with virtual consultations available nationwide.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Knowledge Base (Approved FAQs)</h1>
          <p className="text-sm text-gray-400">Approved business answers that AI voice receptionists use during caller interactions.</p>
        </div>
        <button className="bg-gradient-to-r from-teal-500 to-electric-600 hover:from-teal-600 hover:to-electric-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Item</span>
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <h4 className="text-base font-bold text-teal-300">Q: {f.q}</h4>
            <p className="text-sm text-gray-200">A: {f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
