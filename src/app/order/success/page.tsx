import type { Metadata } from "next";
import OrderSuccess from "@/components/forms/OrderSuccess";

export const metadata: Metadata = { title: "Order received", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string; c?: string; m?: string; paid?: string }> }) {
  const q = await searchParams;
  return <OrderSuccess id={q.id ?? ""} contact={q.c ?? "whatsapp"} market={q.m} paid={q.paid === "1"} />;
}
