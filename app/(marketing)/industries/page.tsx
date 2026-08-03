import { Navbar } from "@/components/ui/navbar";
import { Building2, Stethoscope, Scale, Home, Wrench, Sparkles } from "lucide-react";

const TEMPLATES = [
  {
    title: "Dental & Medical Clinics",
    icon: Stethoscope,
    description: "Patient appointment booking, after-hours intake, emergency triage escalation, hygiene appointment scheduling.",
  },
  {
    title: "Law Offices & Legal Consultations",
    icon: Scale,
    description: "Client consultation scheduling, practice-area qualification, conflict-check disclaimer, urgent legal transfer.",
  },
  {
    title: "Real Estate Agencies",
    icon: Home,
    description: "Buyer/seller lead classification, property interest intake, viewing appointment scheduling, agent handoff.",
  },
  {
    title: "Home Services & Contractors",
    icon: Wrench,
    description: "Service request intake, emergency dispatch qualification, quote consultation booking, callback task creation.",
  },
  {
    title: "Salons & Spas",
    icon: Sparkles,
    description: "Service selection, staff preference management, appointment booking, rescheduling, and cancellation.",
  },
  {
    title: "SaaS & Corporate Consulting",
    icon: Building2,
    description: "High-value commercial lead qualification, budget evaluation, instant partner consultation scheduling.",
  },
];

export default function IndustriesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-4">
          <span className="px-3 py-1 rounded-full bg-teal-950 text-teal-400 border border-teal-800/60 font-mono text-xs font-semibold">
            INDUSTRY TEMPLATES
          </span>
          <h1 className="text-4xl font-extrabold text-white">Pre-Configured Industry Workflows</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            Deploy tailored voice receptionist templates designed for specific business operational rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEMPLATES.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4 hover:border-teal-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{t.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{t.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
