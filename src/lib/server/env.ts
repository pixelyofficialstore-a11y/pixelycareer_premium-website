import "server-only";

const REQUIRED = ["DATABASE_URL", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "CRM_WEBHOOK_SECRET", "CRON_SECRET", "TURNSTILE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"] as const;
type Key = (typeof REQUIRED)[number] | "META_CAPI_TOKEN" | "NEXT_PUBLIC_META_PIXEL_ID" | "META_TEST_EVENT_CODE";

/** A required server setting. Throws a clear error naming the missing variable (the client only ever sees a generic message). */
export function env(name: Key): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}. Add it to .env.local (see .env.example).`);
  return v;
}
export const optionalEnv = (name: Key) => process.env[name] || "";
export const missingEnv = () => REQUIRED.filter((k) => !process.env[k]);
/** Marks an error caused by a missing setting, so routes can answer 503 instead of 500. */
export const isConfigError = (e: unknown) => e instanceof Error && /^Missing environment variable|DATABASE_URL is not a valid URL/.test(e.message);
