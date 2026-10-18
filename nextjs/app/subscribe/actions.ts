"use server";

import { revalidatePath } from "next/cache";
import {
  bumpConfirmSent,
  upsertPending,
  SubscriberSource,
} from "@/lib/store/subscribers-store";
import { confirmPath } from "@/lib/subscriber-tokens";

export type SignupState =
  | { kind: "idle" }
  | {
      kind: "pending-confirm";
      email: string;
      firstName?: string;
      confirmPath: string;
      resent: boolean;
    }
  | { kind: "already-consented"; email: string }
  | { kind: "unsubscribed"; email: string }
  | { kind: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const source =
    (String(formData.get("source") ?? "landing") as SubscriberSource) || "landing";

  if (!email) return { kind: "error", message: "Please enter your email." };
  if (!EMAIL_RE.test(email)) {
    return { kind: "error", message: "Please enter a valid email address." };
  }

  try {
    const result = await upsertPending({
      email,
      firstName: firstName || undefined,
      source,
    });
    revalidatePath("/admin/subscribers");

    if (result.kind === "already-consented") {
      return { kind: "already-consented", email: result.record.email };
    }
    if (result.kind === "unsubscribed") {
      return { kind: "unsubscribed", email: result.record.email };
    }
    return {
      kind: "pending-confirm",
      email: result.record.email,
      firstName: result.record.firstName,
      confirmPath: confirmPath(result.record.confirmToken),
      resent: result.kind === "resent",
    };
  } catch {
    return {
      kind: "error",
      message: "Something went wrong saving your email. Please try again.",
    };
  }
}

export async function resendConfirmationAction(
  email: string,
): Promise<{ ok: true; confirmPath: string } | { ok: false; error: string }> {
  const record = await bumpConfirmSent(email);
  if (!record) return { ok: false, error: "No pending record for that email." };
  if (record.status !== "pending-confirm") {
    return { ok: false, error: "Subscriber is not pending confirmation." };
  }
  revalidatePath("/admin/subscribers");
  return { ok: true, confirmPath: confirmPath(record.confirmToken) };
}
