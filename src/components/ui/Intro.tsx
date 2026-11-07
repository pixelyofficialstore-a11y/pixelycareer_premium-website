import fs from "fs";
import path from "path";
import Script from "next/script";

/*
 * Loading screen: the brand story in about 2.1s. Grey CVs drop into a pile, the blue CV lifts out of
 * it and lands in front, the logo's two pixels pop in, then a curtain wipes up to reveal the hero.
 * - Runs as CSS, so it plays right away and never waits for React.
 * - Plays on every full load of a market home. Skipped for reduced motion.
 * - Turn it off with NEXT_PUBLIC_ENABLE_INTRO=false.
 */
const CURTAIN_STARTS = 1650; // ms. Keep in step with the delay on #intro in globals.css.

const SCRIPT = `(function(){
  var d=document.documentElement;
  if(["/","/pk","/ae","/sa","/uk"].indexOf(location.pathname)<0)return;
  try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return}catch(e){return}
  d.setAttribute("data-intro","on");
  setTimeout(function(){d.setAttribute("data-intro","done")},${CURTAIN_STARTS});
})();`;

export default function Intro() {
  if (process.env.NEXT_PUBLIC_ENABLE_INTRO === "false") return null;
  // Inlined so the two official pixel squares can animate as their own layers.
  const mark = fs.readFileSync(path.join(process.cwd(), "public/brand/mark-white.svg"), "utf8").replace(' role="img" aria-label="Pixely Careers"', "");
  // Keep the overlay mounted: CSS moves it offscreen without changing React's hydration markup.
  const html = `<div id="intro" aria-hidden="true"><div class="intro-stage"><div class="intro-sheet intro-s1"></div><div class="intro-sheet intro-s2"></div><div class="intro-cv">${mark}<i></i></div><div class="intro-sheet intro-s3"></div></div></div>`;
  return (
    <>
      <Script id="pixely-intro-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
