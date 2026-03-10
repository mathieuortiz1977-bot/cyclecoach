"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Home", icon: "📊" },
  { href: "/plan", label: "Plan", icon: "📅" },
  { href: "/workouts", label: "Workouts", icon: "💪" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card)]/95 backdrop-blur-md border-t border-[var(--card-border)] flex justify-around pt-2 px-4 pb-safe z-50 md:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0.5rem), 0.5rem)" }}
    >
      {nav.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-xs transition-colors min-w-[64px] ${
              active ? "text-[var(--accent)]" : "text-[var(--muted)]"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[11px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
