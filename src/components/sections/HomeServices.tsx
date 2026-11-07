"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import type { MarketKey } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import styles from "./HomeServices.module.css";

const SERVICES = [
  {
    title: "Career documents",
    description: "ATS CVs, Europass and cover letters.",
    href: "/services/ats-cv",
    link: "Explore CV writing",
  },
  {
    title: "Professional visibility",
    description: "A LinkedIn profile recruiters can find.",
    href: "/services/linkedin",
    link: "Explore LinkedIn",
  },
  {
    title: "Digital presence",
    description: "A personal website with your name on it.",
    href: "/services/portfolio-website",
    link: "Explore portfolio websites",
  },
];

export default function HomeServices({ marketKey }: { marketKey: MarketKey }) {
  const sectionRef = useRef<HTMLElement>(null);
  const persona = HERO_PERSONAS[marketKey].sample;
  const cv = HERO_PERSONAS[marketKey].images.good;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    section.dataset.animate = "true";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.dataset.entered = "true";
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      delete section.dataset.animate;
      delete section.dataset.entered;
    };
  }, []);

  return (
    <section ref={sectionRef} id="services" aria-labelledby="services-title" className={styles.section}>
      <div className={`wrap ${styles.container}`}>
        <header className={styles.heading}>
          <h2 id="services-title" className={`h1 ${styles.title}`}>
            Three layers. <em>One brand.</em>
          </h2>
        </header>

        <ul className={styles.gallery}>
          <li className={styles.card}>
            <Link href={SERVICES[0].href} className={styles.service}>
              <div className={styles.frame} aria-hidden="true">
                <div className={`${styles.mockup} ${styles.resume}`}>
                  <Image
                    src={cv.src}
                    width={cv.width}
                    height={cv.height}
                    alt=""
                    priority
                    sizes="200px"
                  />
                </div>
              </div>
              <div className={styles.copy}>
                <h3>{SERVICES[0].title}</h3>
                <p>{SERVICES[0].description}</p>
                <span className={styles.link}>{SERVICES[0].link}<ArrowRight size={16} /></span>
              </div>
            </Link>
          </li>

          <li className={styles.card}>
            <Link href={SERVICES[1].href} className={styles.service}>
              <div className={styles.frame} aria-hidden="true">
                <div className={`${styles.mockup} ${styles.profile}`}>
                  <div className={styles.profileBanner} />
                  <div className={styles.profileContent}>
                    <span className={styles.avatar}>{persona.initials}</span>
                    <strong>{persona.name}</strong>
                    <span className={styles.role}>{persona.role}</span>
                    <span className={styles.openToWork}>Open to work</span>
                  </div>
                </div>
              </div>
              <div className={styles.copy}>
                <h3>{SERVICES[1].title}</h3>
                <p>{SERVICES[1].description}</p>
                <span className={styles.link}>{SERVICES[1].link}<ArrowRight size={16} /></span>
              </div>
            </Link>
          </li>

          <li className={styles.card}>
            <Link href={SERVICES[2].href} className={styles.service}>
              <div className={styles.frame} aria-hidden="true">
                <div className={`${styles.mockup} ${styles.website}`}>
                  <div className={styles.browserBar}>{persona.domain}</div>
                  <div className={styles.websiteHero}>
                    <strong>{persona.name}</strong>
                    <span>{persona.role}</span>
                    <span className={styles.viewWork}>View my work</span>
                  </div>
                </div>
              </div>
              <div className={styles.copy}>
                <h3>{SERVICES[2].title}</h3>
                <p>{SERVICES[2].description}</p>
                <span className={styles.link}>{SERVICES[2].link}<ArrowRight size={16} /></span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
