import Image from "next/image";

const SHADOW = "shadow-[0_30px_50px_-20px_rgb(1_12_40/0.35)]";

/** The real good CV, cropped to its top 60%. */
export function CvVisual({ alt = "Single-column ATS CV written by Pixely Careers", sizes = "(min-width: 1024px) 22vw, 60vw" }: { alt?: string; sizes?: string }) {
  return (
    <div className={`w-[66%] overflow-hidden rounded-t-[4px] border border-[#e1e4ea] bg-white ${SHADOW}`} style={{ aspectRatio: "1655 / 1404", rotate: "-3deg" }}>
      <Image src="/cv/good-cv-ats-single-column.webp" alt={alt} width={1655} height={2340} sizes={sizes} className="block h-auto w-full" />
    </div>
  );
}

/** A generic professional profile, no logo or trademark. */
export function ProfileVisual() {
  return (
    <div aria-hidden="true" className={`w-[80%] overflow-hidden rounded-xl border border-[#e6e9f0] bg-white ${SHADOW}`}>
      <div className="h-[clamp(56px,6vw,84px)] bg-vivid" />
      <div className="px-[6%] pb-[6%]">
        <span className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-navy text-lg font-semibold text-white">YN</span>
        <p className="mt-2 text-[17px] leading-tight font-semibold">Your Name</p>
        <p className="mt-1 text-[12.5px] leading-snug text-navy/70">Your Target Role | Key Skills</p>
        <p className="mt-4 text-[13px] font-semibold">About</p>
        <p className="mt-1 text-[12px] leading-[1.5] text-navy/70">Experienced professional who turns complex work into clear results. Open to new roles in my target market.</p>
      </div>
    </div>
  );
}

export function BrowserVisual() {
  return (
    <div aria-hidden="true" className={`w-[86%] overflow-hidden rounded-xl border border-[#e6e9f0] bg-white ${SHADOW}`}>
      <div className="flex items-center gap-1.5 border-b border-[#e6e9f0] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#d7dbe4]" />
        <span className="h-2 w-2 rounded-full bg-[#d7dbe4]" />
        <span className="h-2 w-2 rounded-full bg-[#d7dbe4]" />
        <span className="ml-2 flex-1 rounded-full bg-mist px-3 py-0.5 text-[10.5px] text-navy/70">yourname.com</span>
      </div>
      <div className="bg-navy px-[6%] py-[6%] text-white">
        <p className="text-[19px] leading-tight font-semibold">Your Name</p>
        <p className="mt-1 text-[12px] text-white/75">Your Target Role</p>
        <span className="mt-3 inline-block rounded-full bg-vivid px-3 py-1 text-[11px] font-medium">View my work</span>
      </div>
      <div className="grid grid-cols-3 gap-2 p-[5%]">
        {["Case study", "Projects", "Contact"].map((t) => (
          <span key={t} className="rounded-md border border-[#e6e9f0] bg-mist px-1.5 py-4 text-center text-[10.5px] font-medium">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A one-page letter, with sample text only. */
export function LetterVisual() {
  return (
    <div aria-hidden="true" className={`w-[62%] rounded-[4px] border border-[#e1e4ea] bg-white p-[5%] ${SHADOW}`} style={{ rotate: "-2deg" }}>
      <p className="text-[17px] leading-tight font-semibold">Your Name</p>
      <p className="mt-1 text-[10px] text-navy/70">Your Target Role · you@email.com</p>
      <p className="mt-1 border-t-2 border-vivid pt-2 text-[10px] text-navy/70">Date</p>
      <div className="mt-3 space-y-2.5 text-[10.5px] leading-[1.55] text-navy/80">
        <p>I’m applying for the Senior Accountant role. I’ve spent five years managing month-end close for multi-entity businesses.</p>
        <p>In my current role I led the move to a shared reporting calendar, which gave managers their numbers earlier each month.</p>
        <p>I’d welcome the chance to talk about what your finance team needs next, and how I can help.</p>
      </div>
      <p className="mt-4 text-[10.5px] text-navy/80">Kind regards,</p>
      <p className="mt-3 w-[46%] border-b border-navy/40 pb-1 text-[12px] font-medium">Your Name</p>
    </div>
  );
}

/** A Europass-style page, with no EU logo. */
export function EuropassVisual() {
  const heading = "mt-3 border-b border-vivid/40 pb-0.5 text-[10.5px] font-semibold text-vivid";
  return (
    <div aria-hidden="true" className={`flex w-[62%] overflow-hidden rounded-[4px] border border-[#e1e4ea] bg-white ${SHADOW}`} style={{ rotate: "2deg" }}>
      <span className="w-[4%] flex-none bg-vivid" />
      <div className="flex-1 p-[5%]">
        <p className="text-[17px] leading-tight font-semibold">Your Name</p>
        <p className="mt-1 text-[10px] text-navy/70">Your Target Role</p>
        <p className={heading}>About me</p>
        <p className="mt-1 text-[10px] leading-[1.5] text-navy/80">A short professional summary, written for your target role.</p>
        <p className={heading}>Work experience</p>
        <p className="mt-1 text-[10px] leading-[1.5] text-navy/80">Prepared monthly reconciliations for 12 client accounts and supported the year-end audit.</p>
        <p className={heading}>Education and training</p>
        <p className="mt-1 text-[10px] leading-[1.5] text-navy/80">Degree Name, University Name</p>
        <p className={heading}>Language skills</p>
        <p className="mt-1 text-[10px] leading-[1.5] text-navy/80">English: C1 · Second language: B2</p>
      </div>
    </div>
  );
}

export function ServiceVisual({ kind, alt, sizes, large }: { kind: "cv" | "letter" | "europass" | "profile" | "browser"; alt?: string; sizes?: string; large?: boolean }) {
  if (kind === "cv") return <CvVisual alt={alt} sizes={sizes} />;
  const Mock = { letter: LetterVisual, europass: EuropassVisual, profile: ProfileVisual, browser: BrowserVisual }[kind];
  return large ? (
    <div className="svc-large flex w-full justify-center">
      <Mock />
    </div>
  ) : (
    <Mock />
  );
}
