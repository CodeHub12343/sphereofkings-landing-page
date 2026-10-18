import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AFF_SESSION_COOKIE } from "@/lib/affiliate-auth";

// Both GET and POST so a signout link or form both work.
async function signOut() {
  const jar = await cookies();
  jar.delete(AFF_SESSION_COOKIE);
  redirect("/affiliate/signin");
}

export const GET = signOut;
export const POST = signOut;
