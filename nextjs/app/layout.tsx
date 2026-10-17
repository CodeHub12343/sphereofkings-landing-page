import type { Metadata } from "next";
import StyledRegistry from "@/lib/StyledRegistry";
import { GlobalStyle } from "@/lib/GlobalStyle";
import Providers from "./providers";
import "./fonts.css";

export const metadata: Metadata = {
  title: "Sphere of Kings 7-in-1 — Coming to Kickstarter November 19, 2026",
  description:
    "A revolutionary 360° board game where strategy, creativity, and imagination collide. Launching on Kickstarter November 19, 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledRegistry>
          <GlobalStyle />
          <Providers>{children}</Providers>
        </StyledRegistry>
      </body>
    </html>
  );
}
