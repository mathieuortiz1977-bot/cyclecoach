"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/plan", label: "Training Plan", icon: "📅" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--card)] border-r border-[var(--card-border)] flex flex-col p-4">
      <Link href="/dashboard" className="flex items-center gap-3 mb-8 px-2">
        <span className="text-3xl">🚴</span>
        <div>
          <h1 className="text-xl font-bold text-[var(--accent)]">CycleCoach</h1>
          <p className="text-xs text-[var(--muted)]">Train with personality</p>
        </div>
      </Link>
      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[var(--accent)] text-white font-medium"
                  : "text-[var(--muted)] hover:text-white hover:bg-[var(--card-border)]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-2">
        <ThemeToggle />
        <UserMenu />
        <div className="px-2 py-2 text-xs text-[var(--muted)]">
          <p>Powered by suffering</p>
          <p>and structured intervals</p>
        </div>
      </div>
    </aside>
  );
}
