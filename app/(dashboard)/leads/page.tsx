import { Users, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

export default function LeadsPage() {
  const leads = [
    {
      id: "lead-01",
      name: "Sarah Miller",
      company: "Miller Miller LLP",
      service: "Commercial Contract Review",
      budget: "$5,000 - $10,000",
      timeline: "Immediate",
      score: 85,
      category: "HOT",
      status: "QUALIFIED",
    },
    {
      id: "lead-02",
      name: "Priya Shah",
      company: "Shah Real Estate Capital",
      service: "Corporate Real Estate Legal Counsel",
      budget: "> $25,000",
      timeline: "Next Month",
      score: 92,
      category: "HOT",
      status: "ASSIGNED",
    },
    {
      id: "lead-03",
      name: "Daniel Brooks",
      company: "Brooks Logistics",
      service: "General Legal Consultation",
      budget: "$2,500",
      timeline: "Flexible",
      score: 65,
      category: "WARM",
      status: "NEW",
    },
    {
      id: "lead-04",
      name: "Michael Chen",
      company: "Individual",
      service: "Urgent Legal Notice",
      budget: "Unknown",
      timeline: "Immediate",
      score: 40,
      category: "REVIEW",
      status: "ESCALATED",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Lead Qualification Matrix</h1>
        <p className="text-sm text-gray-400">Automated BANT / CHAMP lead scoring and qualification breakdowns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/20 text-center">
          <span className="text-xs font-mono text-emerald-400 block">HOT LEADS</span>
          <span className="text-2xl font-extrabold text-white">2</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-teal-800/60 bg-teal-950/20 text-center">
          <span className="text-xs font-mono text-teal-400 block">WARM LEADS</span>
          <span className="text-2xl font-extrabold text-white">1</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-amber-800/60 bg-amber-950/20 text-center">
          <span className="text-xs font-mono text-amber-400 block">REVIEW NEEDED</span>
          <span className="text-2xl font-extrabold text-white">1</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
          <span className="text-xs font-mono text-gray-400 block">COLD LEADS</span>
          <span className="text-2xl font-extrabold text-white">0</span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="p-4 rounded-xl bg-gray-950 border border-gray-900 flex items-center justify-between text-xs">
              <div>
                <h4 className="text-sm font-bold text-white">{l.name} <span className="text-xs font-normal text-gray-400">({l.company})</span></h4>
                <p className="text-gray-400 mt-0.5">Service: <strong className="text-white">{l.service}</strong> • Budget: {l.budget} • Timeline: {l.timeline}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded font-bold font-mono ${l.category === "HOT" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-teal-950 text-teal-300 border border-teal-800"}`}>
                  {l.category} ({l.score}/100)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
