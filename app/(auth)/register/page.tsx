"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] text-[#0F172A]">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] p-8 rounded-xl space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#1D4ED8] text-white font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
            V
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Create VoxDesk Workspace
          </h1>
          <p className="text-xs text-[#64748B]">
            Deploy your voice operations environment for business call handling.
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
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#1D4ED8]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g. Northstar Legal Consultations"
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:border-[#1D4ED8]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arslan@example.com"
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
            <span>{loading ? "Creating..." : "Create Workspace"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-[#64748B]">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-[#1D4ED8] font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
