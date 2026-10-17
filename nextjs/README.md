# Sphere of Kings — Next.js

Next.js 15 (App Router) + TypeScript + styled-components port of the landing page in `../site/`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

- `app/layout.tsx` – wraps the app in the styled-components SSR registry (`lib/StyledRegistry.tsx`) and injects global CSS variables / keyframes via `lib/GlobalStyle.tsx`.
- `app/fonts.css` – `@font-face` declarations for Cinzel + Inter (self-hosted from `public/fonts/`).
- `app/page.tsx` – composes the page sections.
- `components/` – one file per section. Interactive sections (`Header`, `Hero`, `Countdown`, `Showcase`, `SignupForm`, `SubscriberCounter`, `Contact`, `SmoothScroll`) are client components.
- `public/images/`, `public/fonts/` – copied from `../site/assets/`.

Styled-components is wired up through the Next.js SWC plugin (`next.config.ts`) and the SSR registry so first-paint HTML already has the styles inlined.
