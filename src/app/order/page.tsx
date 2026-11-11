import { existsSync } from "node:fs";
import path from "node:path";
import OrderForm from "@/components/forms/OrderForm";
import { getPackages } from "@/config/markets";
import { requestMarket } from "@/lib/market-server";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/order",
  "Start Your Order | Pixely Careers",
  "Choose your package and send your order request in one minute. We confirm everything with you on WhatsApp, including your details, delivery and timing.",
);

export default async function Page({ searchParams }: { searchParams: Promise<{ package?: string; market?: string; m?: string }> }) {
  const q = await searchParams;
  const market = await requestMarket(q.market ?? q.m);
  const initial = getPackages(market).find((p) => p.id === q.package)?.id;
  return (
    <OrderForm key={market.key} market={market.key} initial={initial} hasQr={existsSync(path.join(process.cwd(), "public/payments/easypaisa-qr.png"))} />
  );
}
