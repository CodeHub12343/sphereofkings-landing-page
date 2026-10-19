"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import {
  USERNAME_RE,
  createPlayer,
  ensurePlayerIndexes,
  findPlayerByEmail,
  findPlayerByUsername,
  markLogin,
  normalizeUsername,
  PlayerProfile,
  updatePlayer,
} from "@/lib/db/collections/players";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { setPlayerSession, clearPlayerSession, currentPlayer } from "@/lib/auth/player-session";

export interface AccountFormState { error?: string; ok?: boolean; }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENT_YEAR = new Date().getUTCFullYear();

export async function signupAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const yearOfBirthStr = String(formData.get("yearOfBirth") ?? "");

  if (!USERNAME_RE.test(username)) {
    return { error: "Username must be 3–20 characters, letters/numbers/underscore only." };
  }
  if (displayName.length < 1 || displayName.length > 40) {
    return { error: "Display name must be 1–40 characters." };
  }
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 10) return { error: "Password must be at least 10 characters." };
  const yearOfBirth = Number.parseInt(yearOfBirthStr, 10);
  if (!Number.isFinite(yearOfBirth) || yearOfBirth < 1900 || yearOfBirth > CURRENT_YEAR) {
    return { error: "Enter a valid year of birth." };
  }
  const age = CURRENT_YEAR - yearOfBirth;
  if (age < 13) {
    return { error: "You must be 13 or older to create a Sphere of Kings account." };
  }
  const isMinor = age < 18;

  await ensurePlayerIndexes();

  const [takenU, takenE] = await Promise.all([
    findPlayerByUsername(username),
    findPlayerByEmail(email),
  ]);
  if (takenU) return { error: "That username is already in use." };
  if (takenE) return { error: "An account with that email already exists." };

  const passwordHash = await hashPassword(password);
  const id = randomUUID();
  const player: PlayerProfile = {
    id,
    username,
    displayName,
    emailLower: email,
    passwordHash,
    yearOfBirth,
    isMinor,
    consentStatus: isMinor ? "parental-pending" : "none",
    publicProfile: !isMinor, // minors default to private; see child-safety.md §3
    achievements: [],
    createdAt: new Date().toISOString(),
  };
  await createPlayer(player);
  await setPlayerSession(id);
  redirect("/me");
}

export async function signinAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const identifier = String(formData.get("identifier") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) return { error: "Enter your username or email, and your password." };

  const player =
    (await findPlayerByUsername(identifier)) ??
    (await findPlayerByEmail(identifier));
  if (!player) return { error: "No account with those details." };
  const ok = await verifyPassword(password, player.passwordHash);
  if (!ok) return { error: "That password does not match." };
  await markLogin(player.id);
  await setPlayerSession(player.id);
  redirect("/me");
}

export async function signoutAction(): Promise<void> {
  await clearPlayerSession();
  redirect("/");
}

export async function updateProfileAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const me = await currentPlayer();
  if (!me) return { error: "You are not signed in." };
  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 400);
  const publicProfile = formData.get("publicProfile") === "on";
  if (displayName.length < 1 || displayName.length > 40) {
    return { error: "Display name must be 1–40 characters." };
  }
  // Minors cannot flip to a public profile — safe-default per child-safety.md §3.
  const safePublicProfile = me.isMinor ? false : publicProfile;
  await updatePlayer(me.id, { displayName, bio, publicProfile: safePublicProfile });
  return { ok: true };
}
