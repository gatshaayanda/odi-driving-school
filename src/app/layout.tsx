import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PwaRegister from "@/app/pwa-register";
import "./globals.css";
import "./pwa.css";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const EMBEDDED_BROWSER_PATTERN = /WhatsApp|Instagram|FBAN|FBAV|Messenger|Line[/]|Twitter|TikTok|Snapchat/i;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Odi Driving School", template: "%s | Odi Driving School" },
  description: "A clearer path to learning to drive. Explore Odi Driving School and enquire about lessons.",
  applicationName: "Odi Driving School",
  keywords: ["Odi Driving School", "driving lessons", "Gaborone", "Botswana"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: siteUrl, siteName: "Odi Driving School", title: "Odi Driving School", description: "A clearer path to learning to drive.", images: [{ url: "/odi.jpeg", alt: "Odi Driving School instructor" }] },
  twitter: { card: "summary_large_image", title: "Odi Driving School", description: "A clearer path to learning to drive.", images: ["/odi.jpeg"] },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Odi Driving", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#163C52", colorScheme: "light" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") || "";
  const requestedWith = requestHeaders.get("x-requested-with") || "";
  // A social referrer alone does not mean this browser is embedded.
  const embedded =
    EMBEDDED_BROWSER_PATTERN.test(userAgent) ||
    (/Android/i.test(userAgent) && /;\s*wv\)/i.test(userAgent)) ||
    /^(com\.whatsapp|com\.instagram\.android|com\.facebook\.katana|com\.facebook\.lite|com\.facebook\.orca)$/i.test(requestedWith);
  const android = /Android/i.test(userAgent);

  return (
    <html lang="en">
      <body style={embedded ? { overflow: "hidden" } : undefined}>
        <Script id="odi-early-install-capture" strategy="beforeInteractive">
          {'(function(){window.addEventListener("beforeinstallprompt",function(event){var standalone=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;if(standalone)return;event.preventDefault();window.__odiInstallPrompt=event;});})();'}
        </Script>
        <PwaRegister initialEmbedded={embedded} initialAndroid={android} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
