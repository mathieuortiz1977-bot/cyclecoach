import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { LayoutShell } from "@/components/LayoutShell";
import { PWAInstall } from "@/components/PWAInstall";

export const metadata: Metadata = {
  title: "CycleCoach — AI Cycling Training",
  description: "Adaptive cycling training plans with personality. Dark humor coaching, Strava integration, and Claude-powered analysis.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CycleCoach",
    startupImage: "/icons/icon-512x512.png",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Inline script to apply saved theme before paint (prevents flash) */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('cyclecoach-theme');
            if (t === 'light') {
              document.documentElement.classList.replace('dark', 'light');
              document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8f9fa');
            }
          } catch {}
        `}} />
      </head>
      <body className="flex min-h-screen pt-safe">
        <SessionProvider>
          <LayoutShell>{children}</LayoutShell>
          <PWAInstall />
        </SessionProvider>
      </body>
    </html>
  );
}
