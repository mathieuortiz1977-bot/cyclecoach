import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "CycleCoach — AI Cycling Training",
  description: "Adaptive cycling training plans with personality",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="flex min-h-screen">
        <SessionProvider>
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
            {children}
          </main>
          <MobileNav />
        </SessionProvider>
      </body>
    </html>
  );
}
