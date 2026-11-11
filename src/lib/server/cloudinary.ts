import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { env } from "./env";

export const UPLOADS = {
  payment: { folder: "pixely/payments", max: 4 * 1024 * 1024, types: ["jpg", "png", "webp", "pdf"] },
  cv: { folder: "pixely/cvs", max: 5 * 1024 * 1024, types: ["pdf", "doc", "docx"] },
} as const;
export type UploadKind = keyof typeof UPLOADS;

/** File type from its first bytes, never from the name or the browser's MIME type. */
export function sniff(b: Uint8Array): string | null {
  const at = (sig: number[], o = 0) => sig.every((x, i) => b[o + i] === x);
  if (at([0xff, 0xd8, 0xff])) return "jpg";
  if (at([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (at([0x52, 0x49, 0x46, 0x46]) && at([0x57, 0x45, 0x42, 0x50], 8)) return "webp";
  if (at([0x25, 0x50, 0x44, 0x46, 0x2d])) return "pdf";
  if (at([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return "doc";
  if (at([0x50, 0x4b, 0x03, 0x04])) {
    // A .docx is a zip with a word/ folder.
    const head = Buffer.from(b.subarray(0, Math.min(b.length, 256 * 1024))).toString("latin1");
    return head.includes("word/") ? "docx" : null;
  }
  return null;
}

/** Signed server side upload with a random uuid public_id. CVs are raw files; payment images are images, payment PDFs raw. */
export async function upload(kind: UploadKind, bytes: Uint8Array, ext: string) {
  const resource = kind === "payment" && ext !== "pdf" ? "image" : "raw";
  const params: Record<string, string> = {
    folder: UPLOADS[kind].folder,
    public_id: resource === "raw" ? `${randomUUID()}.${ext}` : randomUUID(),
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const form = new FormData();
  form.set("file", new Blob([Buffer.from(bytes)]), `upload.${ext}`);
  for (const [k, v] of Object.entries(params)) form.set(k, v);
  form.set("api_key", env("CLOUDINARY_API_KEY"));
  form.set("signature", createHash("sha1").update(toSign + env("CLOUDINARY_API_SECRET")).digest("hex"));
  const r = await fetch(`https://api.cloudinary.com/v1_1/${env("CLOUDINARY_CLOUD_NAME")}/${resource}/upload`, { method: "POST", body: form });
  if (!r.ok) throw new Error(`Cloudinary upload failed with status ${r.status}`);
  const j = (await r.json()) as { secure_url: string; public_id: string };
  return { secure_url: j.secure_url, public_id: j.public_id };
}

/** Delete an upload (used by the test script). */
export async function destroy(publicId: string, resource: "image" | "raw") {
  const params: Record<string, string> = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const form = new FormData();
  for (const [k, v] of Object.entries(params)) form.set(k, v);
  form.set("api_key", env("CLOUDINARY_API_KEY"));
  form.set("signature", createHash("sha1").update(toSign + env("CLOUDINARY_API_SECRET")).digest("hex"));
  await fetch(`https://api.cloudinary.com/v1_1/${env("CLOUDINARY_CLOUD_NAME")}/${resource}/destroy`, { method: "POST", body: form });
}

/** Only accept URLs that point at our own Cloudinary account and the right folder. */
export function ownUpload(kind: UploadKind, url: string | null | undefined, publicId: string | null | undefined) {
  if (!url || !publicId) return false;
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  return !!cloud && url.startsWith(`https://res.cloudinary.com/${cloud}/`) && publicId.startsWith(`${UPLOADS[kind].folder}/`) && url.includes(publicId);
}
