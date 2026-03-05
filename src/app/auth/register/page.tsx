"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ftp, setFtp] = useState(200);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        window.location.href = "/auth/setup";
      } else {
        window.location.href = "/auth/login";
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <span className="text-5xl">🚴</span>
          <h1 className="text-3xl font-bold text-[var(--accent)] mt-3">Join CycleCoach</h1>
          <p className="text-[var(--muted)] mt-1">Let&apos;s build your training plan</p>
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--accent)]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--accent)]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--accent)]"
                placeholder="••••••••"
              />
              <p className="text-xs text-[var(--muted)] mt-1">At least 6 characters</p>
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-1">Estimated FTP (watts) — you can change this later</label>
              <input
                type="number"
                value={ftp}
                onChange={(e) => setFtp(parseInt(e.target.value) || 100)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-3 text-[var(--accent)] font-bold focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
