export type VideoChapter =
  | "trailer"
  | "gameplay"
  | "instructions"
  | "behind-the-scenes";

export type VideoEntry = {
  id: string;
  chapter: VideoChapter;
  title: string;
  description: string;
  // Durations only when known from the actual asset. Never fabricated.
  durationSeconds?: number;
  // `src` is a direct video URL (mp4/webm). When absent, the entry
  // renders as "Coming soon" and does not expose a play affordance.
  src?: string;
  poster?: string;
  captions?: boolean;
};

// Owner-approved trailer URLs. The newest trailer is the one wired to
// the landing-page hero via `TRAILER_SRC` below; older trailers stay in
// the gallery as additional entries so nothing is lost.
export const TRAILER_SRC =
  "https://res.cloudinary.com/dctvil2gu/video/upload/v1792526572/WhatsApp_Video_2026-10-20_at_4.28.16_AM_ie10dw.mp4";

// Previous trailer kept available for the gallery.
const TRAILER_SRC_OCT13 =
  "https://res.cloudinary.com/dctvil2gu/video/upload/v1791922144/WhatsApp_Video_2026-10-13_at_7.03.01_PM_itshl0.mp4";

export const VIDEOS: VideoEntry[] = [
  {
    id: "trailer-october-20",
    chapter: "trailer",
    title: "Sphere of Kings — October 20 trailer",
    description:
      "The newest look at Sphere of Kings in play — family at the table, every mode on one sphere.",
    src: TRAILER_SRC,
    poster: "/images/d846e954-7329-421e-9b42-85a07f82d117.jpg",
  },
  {
    id: "trailer-kickstarter",
    chapter: "trailer",
    title: "The spherical seven-in-one",
    description:
      "A short look at the board, the seven modes and why Sphere of Kings belongs on your family game shelf.",
    src: TRAILER_SRC_OCT13,
    poster: "/images/d846e954-7329-421e-9b42-85a07f82d117.jpg",
  },
  {
    id: "gameplay-royal-checkers",
    chapter: "gameplay",
    title: "Royal Checkers — opening ideas",
    description:
      "Two players explore the first moves on the 14 × 8 spherical board.",
    poster: "/images/0426fb4f-6550-4e4d-b8c2-42ce56f2a2ef.jpg",
  },
  {
    id: "gameplay-imperial-kings",
    chapter: "gameplay",
    title: "Imperial Kings — a full match",
    description:
      "A complete game from opening to the capture of both kings.",
    poster: "/images/b537bf89-3632-4281-aab5-1d928a83effd.jpg",
  },
  {
    id: "instructions-royal-checkers",
    chapter: "instructions",
    title: "How Royal Checkers works",
    description:
      "Walkthrough for anyone who already plays regular checkers.",
    poster: "/images/08c0600b-f713-4ca9-9dd7-b792d0b9a0bc.jpg",
    captions: true,
  },
  {
    id: "instructions-imperial-kings",
    chapter: "instructions",
    title: "How Imperial Kings works",
    description:
      "Setup, movement and the both-kings winning condition.",
    poster: "/images/de6dcdb2-d872-4b9d-8451-b21622f9ec9e.jpg",
    captions: true,
  },
  {
    id: "bts-prototyping",
    chapter: "behind-the-scenes",
    title: "Prototyping the sphere",
    description:
      "From carved wood to the final 3D-printed assembly, in three minutes.",
    poster: "/images/c298caf6-a7af-4121-9b95-3cb1f16fab72.jpg",
  },
];

export const CHAPTER_LABEL: Record<VideoChapter, string> = {
  trailer: "Trailer",
  gameplay: "Gameplay",
  instructions: "Instructions",
  "behind-the-scenes": "Behind the scenes",
};

export const CHAPTER_TONE: Record<
  VideoChapter,
  "gold" | "crim" | "royal" | "muted"
> = {
  trailer: "gold",
  gameplay: "crim",
  instructions: "royal",
  "behind-the-scenes": "muted",
};
