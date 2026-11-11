/** On server start: name every missing required env var at once, so a bad deploy fails loudly instead of on the first order. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { missingEnv } = await import("@/lib/server/env");
  const missing = missingEnv();
  if (!missing.length) return;
  const msg = `Missing environment variables: ${missing.join(", ")}. See .env.example.`;
  // Never block startup: routes that need a missing variable answer 503 on their own.
  console.warn(msg);
}
