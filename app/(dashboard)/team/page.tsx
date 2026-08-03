import { UserCheck, ShieldCheck } from "lucide-react";

export default function TeamPage() {
  const members = [
    {
      name: "Arslan Vuzmal Lone",
      email: "arslanvuzmallone@gmail.com",
      role: "OWNER",
      status: "ACTIVE",
    },
    {
      name: "Maya Duty Operator",
      email: "operator@northstarlegal.com",
      role: "OPERATOR",
      status: "ACTIVE",
    },
    {
      name: "Analytics Manager",
      email: "analyst@northstarlegal.com",
      role: "ANALYST",
      status: "ACTIVE",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Team Members & RBAC Roles
        </h1>
        <p className="text-sm text-gray-400">
          Workspace member access permissions across Owner, Admin, Operator,
          Analyst, and Viewer roles.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="space-y-3">
          {members.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gray-950 border border-gray-900 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-teal-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">{m.name}</h4>
                  <p className="text-gray-400 mt-0.5">{m.email}</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded font-bold font-mono ${m.role === "OWNER" ? "bg-teal-950 text-teal-400 border border-teal-800" : "bg-gray-900 text-gray-300 border border-gray-800"}`}
              >
                ROLE: {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
