"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
    // Auth pages: no sidebar, no mobile nav, full-screen
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
      <MobileNav />
    </>
  );
}
