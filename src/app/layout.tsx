import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "CycleCoach — AI Cycling Training",
  description: "Adaptive cycling training plans with personality",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#0a0a0a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CycleCoach",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        {/* Main content — shifts for sidebar on desktop, full-width on mobile */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
        {/* Mobile bottom nav */}
        <MobileNav />
      </body>
    </html>
  );
}
