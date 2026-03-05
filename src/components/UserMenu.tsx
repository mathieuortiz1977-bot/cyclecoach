"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="px-2 py-3 text-xs text-[var(--muted)]">Loading...</div>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/auth/login"
        className="block px-3 py-2 rounded-lg text-sm text-[var(--accent)] border border-[var(--accent)] text-center hover:bg-[var(--accent)] hover:text-white transition-colors"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-2">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
            {session.user.name?.[0] || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{session.user.name}</p>
          <p className="text-xs text-[var(--muted)] truncate">{session.user.email}</p>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="w-full px-3 py-1.5 rounded text-xs text-[var(--muted)] hover:text-white hover:bg-[var(--card-border)] transition-colors text-left"
      >
        Sign out
      </button>
    </div>
  );
}
