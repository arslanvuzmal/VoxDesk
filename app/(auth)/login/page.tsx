"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

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
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("An unexpected network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0B0D10] text-[#F4F4F5]">
      <div className="w-full max-w-md bg-[#13171C] border border-[#272D35] p-8 rounded-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#2DD4BF] text-[#0B0D10] font-bold text-lg flex items-center justify-center mx-auto">
            V
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to VoxDesk AI</h1>
          <p className="text-xs text-[#8B949E]">Access voice operations, live call console, and call history.</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="p-3.5 rounded-lg bg-[#171C22] border border-[#272D35] text-xs font-mono space-y-1.5 text-[#D4D4D8]">
          <div className="flex items-center gap-1.5 font-bold text-[#2DD4BF]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>DEMO WORKSPACE CREDENTIALS:</span>
          </div>
          <p><span className="text-[#8B949E]">Email:</span> <strong className="text-white">owner@northstarlegal.com</strong></p>
          <p><span className="text-[#8B949E]">Password:</span> <strong className="text-white">password123</strong></p>
        </div>

        {error && <div className="p-3 rounded-lg bg-[#FB7185]/10 border border-[#FB7185]/30 text-xs text-[#FB7185]">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#D4D4D8] mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#0F1216] border border-[#272D35] text-white focus:outline-none focus:border-[#2DD4BF]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#D4D4D8] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#0F1216] border border-[#272D35] text-white focus:outline-none focus:border-[#2DD4BF]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#8B949E] border-t border-[#272D35] flex items-center justify-between">
          <Link href="/" className="hover:text-white">← Return to Home</Link>
          <Link href="/demo" className="text-[#2DD4BF] hover:underline font-semibold">Explore Demo Sandbox →</Link>
        </div>
      </div>
    </div>
  );
}
