import type { Metadata } from "next";
import OrderSuccess from "@/components/forms/OrderSuccess";

export const metadata: Metadata = { title: "Order received", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string; c?: string; m?: string; paid?: string; t?: string; p?: string; d?: string }> }) {
  const q = await searchParams;
  return <OrderSuccess id={q.id ?? ""} contact={q.c ?? "whatsapp"} market={q.m} paid={q.paid === "1"} amounts={{ total: Number(q.t) || 0, paid: Number(q.p) || 0, discount: Number(q.d) || 0 }} />;
}
