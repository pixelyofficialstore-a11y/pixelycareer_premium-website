import FinalCta from "@/components/sections/FinalCta";
import TeamSection from "@/components/sections/TeamSection";
import Reveal from "@/components/ui/Reveal";
import { requestMarket } from "@/lib/market-server";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/about",
  "About | Pixely Careers",
  "Pixely Careers is a career branding agency for professionals worldwide, with 1,800+ clients served over 3+ years across five markets. Written by people.",
);

const NUMBERS = [
  { n: "1,800+", label: "clients served" },
  { n: "3+", label: "years" },
  { n: "5", label: "markets (US, UK, UAE, Saudi Arabia, Pakistan)" },
];
const DO = ["ATS CVs and cover letters", "LinkedIn and job profiles", "Portfolio websites"];
const DONT = ["Job placement", "Visa or immigration services", "Guarantees we can’t keep"];
const PRINCIPLES = ["Written by people", "Built for your market", "With you until it’s right"];

export default async function Page() {
  const market = await requestMarket();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <section className="page-top wrap">
        <p className="label">About</p>
        <h1 className="page-h1 mt-6 max-w-[16ch]">We build careers, not just CVs.</h1>
        <p className="page-sub">Pixely Careers is a career branding agency for professionals worldwide.</p>
      </section>

      <section aria-label="Numbers" className="wrap mt-20 grid gap-10 md:grid-cols-3 lg:mt-28">
        {NUMBERS.map((x) => (
          <div key={x.n} data-reveal>
            <span className="big-number">{x.n}</span>
            <span className="mt-3 block max-w-[28ch] text-navy/70">{x.label}</span>
          </div>
        ))}
      </section>

      <section className="section wrap grid gap-6 md:grid-cols-2">
        <div className="card p-8 lg:p-10" data-reveal>
          <h2 className="card-title">What we do</h2>
          <ul className="check-list mt-6">
            {DO.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="card p-8 lg:p-10" data-reveal>
          <h2 className="card-title">What we don’t</h2>
          <ul className="mt-6">
            {DONT.map((d) => (
              <li key={d} className="py-2 text-[17px] text-navy/75">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="work-title" className="wrap pb-24 lg:pb-40">
        <h2 id="work-title" className="h2" data-reveal>
          How we work
        </h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <li key={p} className="card lift p-8" data-reveal>
              <span className="p-num" aria-hidden="true">
                0{i + 1}
              </span>
              <p className="mt-5 text-[22px] leading-[1.25] font-medium">{p}</p>
            </li>
          ))}
        </ol>
      </section>

      <TeamSection />
      <FinalCta market={market} />
      <Reveal />
    </>
  );
}
