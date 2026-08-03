"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("Arslan Vuzmal Lone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, workspaceName }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-navy-950">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-gray-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-electric-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create VoxDesk AI Workspace</h1>
          <p className="text-xs text-gray-400">Deploy your multi-tenant AI voice receptionist environment.</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-300 mb-1">Workspace Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g. Apex Dental Practice"
              className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-300 mb-1">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arslan@example.com"
              className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-electric-600 hover:from-teal-600 hover:to-electric-700 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>{loading ? "Creating..." : "Create Workspace"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Already registered?{" "}
          <Link href="/login" className="text-teal-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
