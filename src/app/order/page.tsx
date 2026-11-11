import { existsSync } from "node:fs";
import path from "node:path";
import OrderForm from "@/components/forms/OrderForm";
import { availableAddons } from "@/config/addons";
import { getPackages } from "@/config/markets";
import { requestMarket } from "@/lib/market-server";
import { pageMetadata } from "@/lib/seo";
import { getCart } from "@/lib/carts";
import { isMarketKey, MARKETS, type PackageId } from "@/config/markets";

export const metadata = pageMetadata(
  "/order",
  "Start Your Order | Pixely Careers",
  "Choose your package and send your order request in one minute. We confirm everything with you on WhatsApp, including your details, delivery and timing.",
);

export default async function Page({ searchParams }: { searchParams: Promise<{ package?: string; market?: string; m?: string; addons?: string; offer?: string; cart?: string }> }) {
  const q = await searchParams;
  // A recovery link: everything the visitor had chosen comes back.
  const cart = q.cart ? await getCart(q.cart) : null;
  if (cart && cart.status !== "converted" && isMarketKey(cart.market)) {
    const m = MARKETS[cart.market];
    return (
      <OrderForm key={`cart-${cart.id}`} market={m.key} initial={cart.package as PackageId} initialAddons={cart.addons} offerParam={cart.offer_id === "brand-bundle"}
        restore={{ id: cart.id, name: cart.name, email: cart.email, whatsapp: cart.whatsapp, contact: cart.preferred_contact, country: cart.country, role: cart.role, sameDay: cart.same_day }}
        hasQr={existsSync(path.join(process.cwd(), "public/payments/easypaisa-qr.png"))} />
    );
  }
  const market = await requestMarket(q.market ?? q.m);
  // An offer link always means Executive with the website: the 11.11 Brand Sale (pk).
  const offer = market.key === "pk" && q.offer === "brand-bundle";
  const initial = offer ? "executive" : getPackages(market).find((p) => p.id === q.package)?.id;
  // addons=portfolio,bio preselects add-ons that exist for the chosen package; offer=brand-bundle marks an offer link.
  const allowed = new Set(availableAddons(market, initial ?? "international-pro").map((a) => a.id));
  const initialAddons = Object.fromEntries((offer ? "portfolio" : q.addons ?? "").split(",").filter((id) => allowed.has(id)).map((id) => [id, 1]));
  return (
    <OrderForm key={`${market.key}-${initial ?? ""}-${q.addons ?? ""}-${offer}`} market={market.key} initial={initial} initialAddons={initialAddons} offerParam={offer} hasQr={existsSync(path.join(process.cwd(), "public/payments/easypaisa-qr.png"))} />
  );
}
