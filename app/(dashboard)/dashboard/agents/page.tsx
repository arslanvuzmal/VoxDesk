import { Bot, Plus, CheckCircle2, Settings } from 'lucide-react';

export default function AgentsPage() {
  const agents = [
    {
      id: 'agent-maya',
      name: 'Maya — Reception & Appointments',
      provider: 'DEMO',
      voiceId: 'demo-voice-maya',
      language: 'en-US',
      greeting:
        'Thank you for calling Northstar Legal Consultations. My name is Maya. How can I assist you today?',
      status: 'ACTIVE',
    },
    {
      id: 'agent-alex',
      name: 'Alex — Lead Qualification',
      provider: 'DEMO',
      voiceId: 'demo-voice-alex',
      language: 'en-US',
      greeting:
        'Thank you for contacting Northstar Legal Commercial Practice. My name is Alex. May I ask what business legal services you are looking to retain?',
      status: 'ACTIVE',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Voice Agents</h1>
          <p className="text-sm text-gray-400">
            Configure AI voice receptionists, prompts, greetings, and assigned calendars.
          </p>
        </div>
        <button className="bg-gradient-to-r from-teal-500 to-electric-600 hover:from-teal-600 hover:to-electric-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>New Voice Agent</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map(a => (
          <div key={a.id} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{a.name}</h3>
                  <span className="text-xs font-mono text-gray-400">
                    Provider: <strong className="text-teal-400">{a.provider}</strong>
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold">
                {a.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-950 border border-gray-900 text-xs space-y-1">
              <span className="text-gray-400 font-semibold block">CUSTOM GREETING:</span>
              <p className="text-gray-200 italic">&quot;{a.greeting}&quot;</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
