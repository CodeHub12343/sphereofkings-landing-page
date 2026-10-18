export type ConsentState = "consented" | "unsubscribed" | "pending-confirm";
export type SubSource = "landing" | "contact" | "import" | "donate";

export type SampleSubscriber = {
  email: string;
  firstName?: string;
  signedUpISO: string;
  consent: ConsentState;
  source: SubSource;
  lastEmailSentISO?: string;
};

// The real subscriber list lives in whatever provider the owner wires up
// (Resend, Postmark, Mailchimp…). This sample lets the admin UI be
// reviewed end-to-end — honestly flagged in the UI as such.
export const SAMPLE_SUBSCRIBERS: SampleSubscriber[] = [
  {
    email: "marion.clarke@gmail.com",
    firstName: "Marion",
    signedUpISO: "2026-10-16T08:12:00Z",
    consent: "consented",
    source: "landing",
  },
  {
    email: "benjamin@osei.co",
    firstName: "Benjamin",
    signedUpISO: "2026-10-15T18:48:00Z",
    consent: "consented",
    source: "landing",
    lastEmailSentISO: "2026-10-16T09:00:00Z",
  },
  {
    email: "yemisi.ade@gmail.com",
    firstName: "Yemisi",
    signedUpISO: "2026-10-15T06:03:00Z",
    consent: "consented",
    source: "contact",
  },
  {
    email: "carlos@mendez.io",
    firstName: "Carlos",
    signedUpISO: "2026-10-14T22:11:00Z",
    consent: "pending-confirm",
    source: "landing",
  },
  {
    email: "kingsley.hamid@gmail.com",
    firstName: "Kingsley",
    signedUpISO: "2026-10-13T09:22:00Z",
    consent: "consented",
    source: "donate",
    lastEmailSentISO: "2026-10-14T09:00:00Z",
  },
  {
    email: "aisha.rahman@mail.com",
    firstName: "Aisha",
    signedUpISO: "2026-10-12T14:40:00Z",
    consent: "consented",
    source: "landing",
  },
  {
    email: "lucas.silva@gmail.com",
    signedUpISO: "2026-10-11T11:19:00Z",
    consent: "unsubscribed",
    source: "landing",
  },
  {
    email: "northside.toys@trade.co",
    firstName: "Northside",
    signedUpISO: "2026-10-09T15:04:00Z",
    consent: "consented",
    source: "contact",
  },
  {
    email: "oluchi@okafor.ng",
    firstName: "Oluchi",
    signedUpISO: "2026-10-08T07:30:00Z",
    consent: "consented",
    source: "landing",
  },
  {
    email: "sam.turner@mail.com",
    firstName: "Sam",
    signedUpISO: "2026-10-07T13:17:00Z",
    consent: "pending-confirm",
    source: "landing",
  },
];

export function formatSubRelative(iso: string, nowMs: number = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = nowMs - t;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
