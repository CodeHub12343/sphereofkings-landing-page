"use server";

import { revalidatePath } from "next/cache";
import {
  Tournament, createTournament, ensureTournamentIndexes,
  getTournamentBySlug, Region, REGIONS, updateTournament,
} from "@/lib/db/collections/tournaments";
import { startTournament as engineStart } from "@/lib/tournaments/engine";
// Admin session helper — admin pages across the app already check
// this one; we rely on route-level middleware here.
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readSessionToken } from "@/lib/auth/token";
import type { TournamentSize } from "@/lib/tournaments/bracket";

async function requireAdmin(): Promise<string> {
  const jar = await cookies();
  const payload = await readSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value, "admin");
  if (!payload) throw new Error("not signed in as admin");
  return payload.id;
}

export interface TournamentFormState { error?: string; ok?: boolean; slug?: string; }

const SLUG_RE = /^[a-z0-9-]{3,60}$/;

export async function createTournamentAction(
  _prev: TournamentFormState,
  formData: FormData,
): Promise<TournamentFormState> {
  let adminId: string;
  try { adminId = await requireAdmin(); }
  catch { return { error: "Admin sign-in required." }; }

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const game = String(formData.get("game") ?? "");
  const size = Number.parseInt(String(formData.get("size") ?? "16"), 10);
  const region = String(formData.get("region") ?? "global") as Region;
  const registrationOpensAt = String(formData.get("registrationOpensAt") ?? "");
  const registrationClosesAt = String(formData.get("registrationClosesAt") ?? "");
  const startsAt = String(formData.get("startsAt") ?? "");
  const description = String(formData.get("description") ?? "").trim().slice(0, 2000);

  if (!SLUG_RE.test(slug)) return { error: "Slug must be 3–60 chars: lowercase letters, numbers, dashes." };
  if (name.length < 3) return { error: "Name is too short." };
  if (game !== "royal-checkers" && game !== "imperial-kings") return { error: "Bad game." };
  if (![4, 8, 16, 32].includes(size)) return { error: "Size must be 4, 8, 16, or 32." };
  if (!REGIONS.includes(region)) return { error: "Bad region." };
  if (!registrationOpensAt || !registrationClosesAt || !startsAt) return { error: "All dates required." };

  const regOpen = new Date(registrationOpensAt).getTime();
  const regClose = new Date(registrationClosesAt).getTime();
  const start = new Date(startsAt).getTime();
  if (!(regOpen < regClose && regClose <= start)) {
    return { error: "Dates must be: open < close ≤ start." };
  }

  await ensureTournamentIndexes();
  if (await getTournamentBySlug(slug)) return { error: "Slug already in use." };

  const t: Tournament = {
    slug, name, game, format: "single-elim", size: size as TournamentSize,
    region, status: "upcoming",
    registrationOpensAt: new Date(regOpen).toISOString(),
    registrationClosesAt: new Date(regClose).toISOString(),
    startsAt: new Date(start).toISOString(),
    description,
    bracket: null,
    createdAt: new Date().toISOString(),
    createdByAdminId: adminId,
  };
  await createTournament(t);
  revalidatePath("/admin/tournaments");
  revalidatePath("/tournaments");
  return { ok: true, slug };
}

export async function forceStartAction(slug: string): Promise<TournamentFormState> {
  try { await requireAdmin(); }
  catch { return { error: "Admin sign-in required." }; }
  await updateTournament(slug, { status: "registration" }); // ensure state allows start
  const result = await engineStart(slug);
  revalidatePath(`/tournaments/${slug}`);
  revalidatePath("/admin/tournaments");
  return result ? { ok: true } : { error: "Could not start — check entries count." };
}

export async function cancelTournamentAction(slug: string): Promise<TournamentFormState> {
  try { await requireAdmin(); }
  catch { return { error: "Admin sign-in required." }; }
  await updateTournament(slug, { status: "cancelled", endedAt: new Date().toISOString() });
  revalidatePath("/admin/tournaments");
  revalidatePath(`/tournaments/${slug}`);
  return { ok: true };
}
