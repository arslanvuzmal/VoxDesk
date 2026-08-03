"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@northstarlegal.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
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
          <h1 className="text-2xl font-extrabold text-white">Sign In to VoxDesk AI</h1>
          <p className="text-xs text-gray-400">Access your voice agents, call history, and calendar bookings.</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/60 text-xs font-mono text-teal-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>DEMO CREDENTIALS:</span>
          </div>
          <p>Email: <strong className="text-white">owner@northstarlegal.com</strong></p>
          <p>Password: <strong className="text-white">password123</strong></p>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Don't have a workspace?{" "}
          <Link href="/register" className="text-teal-400 font-semibold hover:underline">
            Create new workspace
          </Link>
        </p>
      </div>
    </div>
  );
}
