import { NextResponse } from "next/server";
import { dbError } from "@/lib/db";
import { isConfigError } from "@/lib/server/env";
import { UPLOADS, sniff, upload, type UploadKind } from "@/lib/server/cloudinary";
import { fail, limited } from "@/lib/server/request";
import { logOrderIssue } from "@/lib/server/order-log";

export const runtime = "nodejs";

/** kind=payment (jpg/png/webp/heic/pdf, 10 MB) or kind=cv (pdf/doc/docx, 5 MB). Checked by magic bytes, then a signed upload to Cloudinary. */
export async function POST(req: Request) {
  if (limited(req, "upload", 10)) return fail(429, "Too many uploads. Please wait a moment.");
  let d: FormData;
  try { d = await req.formData(); } catch { return fail(); }
  if (String(d.get("website") ?? "")) return fail();
  const kind = String(d.get("kind") ?? "") as UploadKind;
  const file = d.get("file");
  if (!(kind in UPLOADS) || !(file instanceof File) || file.size === 0) return fail(400, "Choose a file to upload.");
  const rule = UPLOADS[kind];
  const info = { kind, file: { type: (file.type || "").slice(0, 60), size: file.size, name: (file.name || "").slice(-40) } };
  if (file.size > rule.max) { void logOrderIssue(req, "upload_too_large", info); return fail(400, `The file is too large (max ${rule.max / 1024 / 1024} MB).`); }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniff(bytes);
  if (!ext || !(rule.types as readonly string[]).includes(ext)) { void logOrderIssue(req, "upload_bad_type", info); return fail(400, `Upload a ${rule.types.join(", ").toUpperCase()} file.`); }
  try {
    return NextResponse.json(await upload(kind, bytes, ext));
  } catch (e) {
    console.error("upload failed:", dbError(e));
    void logOrderIssue(req, "upload_failed", { ...info, error: String(dbError(e)).slice(0, 300) });
    if (isConfigError(e)) return fail(503, "This is not configured yet. Please message us on WhatsApp.");
    return fail(500, "The upload failed. Please try again.");
  }
}
