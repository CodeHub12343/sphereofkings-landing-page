# sphereofkings-landing-page

Pre-launch landing page for **Sphere of Kings 7-in-1** — a 360° spherical board game launching on Kickstarter **October 19, 2026**.

Static site built with vanilla HTML, CSS, and JavaScript. No build step.

## Structure

```
site/
├── index.html        # Page markup
├── styles.css        # All styles (fonts + components + responsive)
├── script.js         # Countdown, tab switcher, mobile menu, form submit
└── assets/
    ├── images/       # Product photos (JPG)
    └── fonts/        # Cinzel + Inter (woff2)
```

## Features

- Live countdown to the Kickstarter launch
- 7-in-1 showcase with keyboard-accessible tabs
- Hero + final signup forms wired to [Formspree](https://formspree.io/f/mjgavdkg)
- Responsive layout with a collapsible hamburger drawer on mobile
- Inline Cloudinary-hosted campaign video

## Run locally

Serve the `site/` directory with any static server:

```bash
cd site
python -m http.server 5500
# then open http://localhost:5500
```

Or open `site/index.html` with the VS Code Live Server extension.

## TODO before launch

- Replace social links (Instagram, Facebook, TikTok) in the footer
- Add real Privacy Policy / Terms of Service URLs
- Add Meta Pixel + Google Analytics snippets to `<head>`
- Confirm the Formspree form endpoint and verify the first test submission
