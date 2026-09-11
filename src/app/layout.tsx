import type { Metadata, Viewport } from "next";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";
import { TripProvider } from "@/components/trip-provider";
import { AppShell } from "@/components/app-shell";
export const metadata: Metadata = {
  title: "Listo Para Viajar · Toronto 2026",
  description: "Nuestra bitácora familiar de Manta a Toronto.",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Listo Para Viajar",
  },
  icons: { icon: "/logo.svg", apple: "/icons/icon-192.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf9f5",
};
const themeScript =
  "try{const t=localStorage.getItem('trip-theme')||'auto';document.documentElement.dataset.theme=t==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t}catch{}";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <TripProvider>
          <AppShell>{children}</AppShell>
        </TripProvider>
      </body>
    </html>
  );
}
