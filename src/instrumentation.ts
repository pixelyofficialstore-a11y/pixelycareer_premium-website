/** On server start: name every missing required env var at once, so a bad deploy fails loudly instead of on the first order. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { missingEnv } = await import("@/lib/server/env");
  const missing = missingEnv();
  if (!missing.length) return;
  const msg = `Missing environment variables: ${missing.join(", ")}. See .env.example.`;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") throw new Error(msg);
  console.error(msg);
}
