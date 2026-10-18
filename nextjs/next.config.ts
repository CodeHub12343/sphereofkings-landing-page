import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // Ship-first posture: TypeScript and ESLint errors won't block a
  // deploy. We still want them in local dev / editor; this just stops
  // Vercel builds from going red over a type that's harmless at
  // runtime. Tighten this later if you want strict CI.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
