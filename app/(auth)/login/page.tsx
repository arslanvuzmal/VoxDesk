"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");

  const callbackUrl =
    rawCallback && rawCallback.startsWith("/dashboard")
      ? rawCallback
      : "/dashboard";

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
        router.push(callbackUrl);
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
    <div className="w-full max-w-md bg-white border border-[#E2E8F0] p-8 rounded-xl space-y-6 shadow-sm">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-lg bg-[#1D4ED8] text-white font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
          V
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Sign In to VoxDesk
        </h1>
        <p className="text-xs text-[#64748B]">
          Access voice operations, live call console, and call history.
        </p>
      </div>

      {/* Demo Credentials Box */}
      <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono space-y-1.5 text-[#334155]">
        <div className="flex items-center gap-1.5 font-bold text-[#15803D]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>DEMO WORKSPACE CREDENTIALS:</span>
        </div>
        <p>
          <span className="text-[#64748B]">Email:</span>{" "}
          <strong className="text-[#0F172A]">owner@northstarlegal.com</strong>
        </p>
        <p>
          <span className="text-[#64748B]">Password:</span>{" "}
          <strong className="text-[#0F172A]">password123</strong>
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#B91C1C]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#0F172A] mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#1D4ED8]"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-[#0F172A] mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#1D4ED8]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-[#64748B] border-t border-[#E2E8F0] flex items-center justify-between">
        <Link href="/" className="hover:text-[#0F172A]">
          ← Return to Home
        </Link>
        <Link
          href="/demo"
          className="text-[#1D4ED8] hover:underline font-semibold"
        >
          Explore Demo Sandbox →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] text-[#0F172A]">
      <Suspense
        fallback={<div className="text-xs text-[#64748B]">Loading...</div>}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
