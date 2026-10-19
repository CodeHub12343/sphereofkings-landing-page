// Optional Vercel Blob wrapper. When BLOB_READ_WRITE_TOKEN is unset,
// returns null and callers embed the data URL instead.

export async function putBlob(path: string, body: Buffer | Blob, contentType: string): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { put } = await import("@vercel/blob");
    const result = await put(path, body as Blob, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return result.url;
  } catch (err) {
    console.warn("blob put failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
