import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { LayoutShell } from "@/components/LayoutShell";

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
          <LayoutShell>{children}</LayoutShell>
        </SessionProvider>
      </body>
    </html>
  );
}
