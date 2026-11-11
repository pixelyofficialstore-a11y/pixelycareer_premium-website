import { NextResponse } from "next/server";

/** Retired: the CRM sends Purchase to Meta after payment is verified. Kept so old callers get a clear 410. */
const gone = () => NextResponse.json({ error: "Gone. Purchase is sent by the CRM." }, { status: 410 });
export const GET = gone;
export const POST = gone;
