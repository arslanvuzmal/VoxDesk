import { FileText, Clock, CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";

export default async function CallDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const callId = params.id;

  const transcript = [
    { speaker: "agent", text: "Thank you for calling Northstar Legal Consultations. My name is Maya. How can I assist you today?" },
    { speaker: "caller", text: "Hi, I need to book a legal consultation next Tuesday afternoon." },
    { speaker: "agent", text: "I'd be glad to help you schedule that! May I have your full name and email address?" },
    { speaker: "caller", text: "My name is Sarah Miller and my email is sarah.miller@example.com." },
    { speaker: "agent", text: "Thank you Sarah. We have openings at 2:00 PM EST and 3:30 PM EST. Which works better?" },
    { speaker: "caller", text: "2:00 PM EST is perfect for me." },
    { speaker: "agent", text: "Confirmed! Your Legal Consultation is booked for Tuesday at 2:00 PM EST. A confirmation email has been dispatched." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-teal-400 font-semibold px-2 py-0.5 rounded bg-teal-950 border border-teal-800">
            CALL ID: {callId}
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Inbound Call Detail View</h1>
        </div>
      </div>

      {/* Summary Card */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" />
          <span>Structured Call Summary (Zod Verified)</span>
        </h3>

        <div className="p-4 rounded-xl bg-gray-950 border border-gray-900 text-xs leading-relaxed space-y-2">
          <p className="text-gray-200">
            <strong>Summary:</strong> Caller Sarah Miller booked a legal consultation appointment for next Tuesday at 2:00 PM EST regarding commercial contract review.
          </p>
          <div className="flex flex-wrap gap-4 text-gray-400 pt-2 border-t border-gray-900">
            <span>Intent: <strong className="text-white">Schedule Legal Consultation</strong></span>
            <span>Sentiment: <strong className="text-emerald-400">Positive</strong></span>
            <span>Urgency: <strong className="text-teal-300">High</strong></span>
            <span>Outcome: <strong className="text-emerald-400">APPOINTMENT_SCHEDULED</strong></span>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-400" />
          <span>Speaker-Separated Transcript</span>
        </h3>

        <div className="space-y-3">
          {transcript.map((t, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl text-sm border ${
                t.speaker === "agent" ? "bg-teal-950/30 border-teal-900/50 text-teal-100 ml-6" : "bg-gray-900/80 border-gray-800 text-gray-200 mr-6"
              }`}
            >
              <span className="text-xs font-mono font-bold uppercase block mb-1 opacity-75">{t.speaker}</span>
              <p>{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
