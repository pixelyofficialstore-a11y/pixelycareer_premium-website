"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import { ArrowRight } from "@/components/ui/Icons";
import { BrowserVisual, ProfileVisual } from "./ServiceVisuals";
import styles from "./HomeServices.module.css";

const LAYERS = [
  {
    title: "Career Documents",
    line: "ATS resumes, Europass CVs and cover letters.",
    href: "/services/ats-cv",
    link: "Explore resume writing",
    short: "Resume",
  },
  {
    title: "Professional Visibility",
    line: "A LinkedIn profile recruiters can find.",
    href: "/services/linkedin",
    link: "Explore LinkedIn optimization",
    short: "LinkedIn",
  },
  {
    title: "Digital Presence",
    line: "A portfolio website with your name on it.",
    href: "/services/portfolio-website",
    link: "Explore portfolio websites",
    short: "Website",
  },
];

/** Root-homepage trial. Selection moves the actual artifacts, not a reveal target. */
export default function HomeServices() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const cv = HERO_PERSONAS.us.images.good;

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % LAYERS.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + LAYERS.length - 1) % LAYERS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = LAYERS.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <section id="services" aria-labelledby="services-title" className={styles.section}>
      <div className="wrap">
        <div className={styles.heading}>
          <h2 id="services-title" className={styles.title}>
            Three layers. <em>One brand.</em>
          </h2>
          <p className={styles.intro}>Your experience, connected.<br />On paper. Online. Everywhere.</p>
        </div>

        <div className={styles.workspace}>
          <ol className={styles.list} aria-label="Explore your three brand layers">
            {LAYERS.map((layer, index) => (
              <li key={layer.href} className={styles.item} data-active={active === index}>
                <h3 className={styles.name}>
                  <button
                    type="button"
                    className={styles.select}
                    ref={(element) => { buttons.current[index] = element; }}
                    aria-pressed={active === index}
                    aria-controls="home-services-preview"
                    aria-label={`Preview ${layer.title}`}
                    onClick={() => setActive(index)}
                    onKeyDown={(event) => navigate(event, index)}
                  >
                    <span className={styles.number} aria-hidden="true">0{index + 1}</span>
                    <span>{layer.title}</span>
                    <span className={styles.indicator} aria-hidden="true" />
                  </button>
                </h3>
                <p className={styles.description}>{layer.line}</p>
                <Link href={layer.href} className={styles.link}>
                  {layer.link}<ArrowRight />
                </Link>
              </li>
            ))}
          </ol>

          <div id="home-services-preview" className={styles.stage} role="region" aria-label="Professional brand preview">
            <div className={styles.stageTop}>
              <span>One professional identity</span>
              <span aria-live="polite" aria-atomic="true">0{active + 1} / {LAYERS[active].short}</span>
            </div>
            <div className={styles.stack} aria-hidden="true">
              <div className={styles.sheet} data-position={(3 - active) % 3}>
                <div className={styles.resume}>
                  <Image src={cv.src} width={cv.width} height={cv.height} alt="" sizes="(min-width: 1024px) 340px, (min-width: 768px) 30vw, 65vw" />
                </div>
              </div>
              <div className={`${styles.sheet} ${styles.mock}`} data-position={(4 - active) % 3}>
                <ProfileVisual />
              </div>
              <div className={`${styles.sheet} ${styles.mock}`} data-position={(5 - active) % 3}>
                <BrowserVisual />
              </div>
            </div>
            <div className={styles.caption} aria-hidden="true">
              <span data-active={active === 0}>Resume</span><i />
              <span data-active={active === 1}>LinkedIn</span><i />
              <span data-active={active === 2}>Website</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
