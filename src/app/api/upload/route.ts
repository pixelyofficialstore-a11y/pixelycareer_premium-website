import { NextResponse } from "next/server";
import { UPLOADS, sniff, upload, type UploadKind } from "@/lib/server/cloudinary";
import { fail, limited } from "@/lib/server/request";

export const runtime = "nodejs";

/** kind=payment (jpg/png/webp/pdf, 4 MB) or kind=cv (pdf/doc/docx, 5 MB). Checked by magic bytes, then a signed upload to Cloudinary. */
export async function POST(req: Request) {
  if (limited(req, "upload", 10)) return fail(429, "Too many uploads. Please wait a moment.");
  let d: FormData;
  try { d = await req.formData(); } catch { return fail(); }
  if (String(d.get("website") ?? "")) return fail();
  const kind = String(d.get("kind") ?? "") as UploadKind;
  const file = d.get("file");
  if (!(kind in UPLOADS) || !(file instanceof File) || file.size === 0) return fail(400, "Choose a file to upload.");
  const rule = UPLOADS[kind];
  if (file.size > rule.max) return fail(400, `The file is too large (max ${rule.max / 1024 / 1024} MB).`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniff(bytes);
  if (!ext || !(rule.types as readonly string[]).includes(ext)) return fail(400, `Upload a ${rule.types.join(", ").toUpperCase()} file.`);
  try {
    return NextResponse.json(await upload(kind, bytes, ext));
  } catch (e) {
    console.error("upload failed:", e instanceof Error ? e.message : "unknown");
    return fail(500, "The upload failed. Please try again.");
  }
}
