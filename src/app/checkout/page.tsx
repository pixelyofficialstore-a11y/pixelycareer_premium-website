import OrderPage from "@/app/order/page";
import { pageMetadata } from "@/lib/seo";

type Q = { package?: string; addons?: string; offer?: string; cart?: string };
export const metadata = { ...pageMetadata("/checkout", "Place your order | Pixely Careers", "Choose your plan, add your details and pay online with Easypaisa, JazzCash or bank transfer."), robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<Q> }) {
  const q = await searchParams;
  return OrderPage({ searchParams: Promise.resolve({ ...q, market: "pk" }) });
}
