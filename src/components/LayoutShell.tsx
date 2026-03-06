"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* pb-24 on mobile for bottom nav + safe area; pb-8 on desktop */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-full overflow-x-hidden">
        {children}
      </main>
      <MobileNav />
    </>
  );
}
