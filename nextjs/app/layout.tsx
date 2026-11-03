import type { Metadata, Viewport } from "next";
import StyledRegistry from "@/lib/StyledRegistry";
import { GlobalStyle } from "@/lib/GlobalStyle";
import Providers from "./providers";
import AppChrome from "@/components/app/AppChrome";
import "./fonts.css";

export const metadata: Metadata = {
  title: "Sphere of Kings 7-in-1 — Coming to Kickstarter November 19, 2026",
  description:
    "A revolutionary 360° board game where strategy, creativity, and imagination collide. Launching on Kickstarter November 19, 2026.",
  // The icon + apple-icon routes in /app auto-register, but we also
  // declare them explicitly so the <link rel="shortcut icon"> is set
  // for older browsers and crawlers.
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/apple-icon",
  },
  manifest: "/manifest.webmanifest",
  // Open Graph / social preview — same brand mark looks good in link
  // previews on iMessage, WhatsApp, Discord, etc.
  openGraph: {
    title: "Sphere of Kings 7-in-1",
    description: "Spherical strategy games — Royal Checkers, Imperial Kings, and the full 7-in-1 experience.",
    images: ["/icon"],
    type: "website",
  },
  // Apple-specific hints — tells iOS "treat this as a standalone web
  // app when added to the home screen" (hides Safari chrome).
  appleWebApp: {
    capable: true,
    title: "Sphere of Kings",
    statusBarStyle: "black-translucent",
  },
};

// Separate viewport export (Next 15 convention). Theme colour matches
// the near-black app chrome so the phone's status bar blends into the
// top bar. viewport-fit=cover lets the installed app draw edge to edge;
// the app chrome pads itself with env(safe-area-inset-*) so nothing
// sits under the notch or home indicator.
export const viewport: Viewport = {
  themeColor: "#0a0806",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledRegistry>
          <GlobalStyle />
          <Providers>
            <AppChrome>{children}</AppChrome>
          </Providers>
        </StyledRegistry>
      </body>
    </html>
  );
}
