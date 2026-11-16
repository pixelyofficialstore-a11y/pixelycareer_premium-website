import { MARKETS } from "@/config/markets";
import FinalCta from "@/components/sections/FinalCta";
import { whatsappMessage } from "@/lib/site";

/** Blog CTA: points to the Pakistan plans. Posts about Gulf, UK or European CVs add a WhatsApp line for visitors abroad. */
export default function MarketFinalCta({ abroad = false }: { abroad?: boolean }) {
  return (
    <>
      <FinalCta market={MARKETS.pk} variant="blog" />
      {abroad && <p className="usd-note">Applying from outside Pakistan? <a href={whatsappMessage("Hi, I'm applying from outside Pakistan. Can you help with my CV?")} target="_blank" rel="noopener noreferrer" data-cta="blog-abroad-whatsapp">Chat with us on WhatsApp.</a></p>}
    </>
  );
}
