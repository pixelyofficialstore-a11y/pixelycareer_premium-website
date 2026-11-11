"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import type { MarketKey } from "@/config/markets";
import { ArrowRight } from "@/components/ui/Icons";
import styles from "./HomeServices.module.css";

/** The three cards. Titles and links are the same everywhere; the words follow the market. */
function getServices(market: MarketKey) {
  return [
    {
      title: "Get shortlisted",
      description: market === "us" ? "ATS resumes and cover letters built to get read."
        : market === "uk" ? "ATS CVs and cover letters built to get read."
        : "ATS CVs and cover letters for Gulf and global roles.",
      href: "/services/ats-cv",
      link: market === "us" ? "Explore resume writing" : "Explore CV writing",
    },
    {
      title: "Get found",
      description: "LinkedIn profiles built to rank in recruiter searches.",
      href: "/services/linkedin",
      link: "Explore profile optimization",
    },
    {
      title: "Get remembered",
      description: "Your own website built to showcase your story and work.",
      href: "/services/portfolio-website",
      link: "Explore portfolio websites",
    },
  ];
}

export default function HomeServices({ marketKey }: { marketKey: MarketKey }) {
  const sectionRef = useRef<HTMLElement>(null);
  const SERVICES = getServices(marketKey);
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
        <header className={styles.heading} data-reveal>
          <h2 id="services-title" className={`h2 ${styles.title}`}>
            One story. <em>Everywhere they look.</em>
          </h2>
        </header>

        <ul className={styles.gallery}>
          <li className={styles.card}>
            <Link href={SERVICES[0].href} className={styles.service} data-cta="home-services-cv">
              <div className={styles.frame} aria-hidden="true">
                <div className={`${styles.mockup} ${styles.resume}`}>
                  <Image
                    src={cv.src}
                    width={cv.width}
                    height={cv.height}
                    alt={cv.alt ?? ""}
                    {...(cv.hd ? { loading: "lazy" as const, quality: cv.quality } : { priority: true })}
                    sizes={cv.hd ? "360px" : "200px"}
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
            <Link href={SERVICES[1].href} className={styles.service} data-cta="home-services-linkedin">
              <div className={styles.frame} aria-hidden="true">
                {marketKey === "us" ? (
                  // US: the designed LinkedIn profile for James Carter
                  <div className={styles.profileShot}>
                    <Image src="/samples/us/us-linkedin-profile.webp" width={1448} height={1086} alt="" sizes="360px" quality={95} loading="lazy" />
                  </div>
                ) : (
                  <div className={`${styles.mockup} ${styles.profile}`}>
                    <div className={styles.profileBanner} />
                    <div className={styles.profileContent}>
                      <span className={styles.avatar}>{persona.initials}</span>
                      <strong>{persona.name}</strong>
                      <span className={styles.role}>{persona.role}</span>
                      <span className={styles.openToWork}>Open to work</span>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.copy}>
                <h3>{SERVICES[1].title}</h3>
                <p>{SERVICES[1].description}</p>
                <span className={styles.link}>{SERVICES[1].link}<ArrowRight size={16} /></span>
              </div>
            </Link>
          </li>

          <li className={styles.card}>
            <Link href={SERVICES[2].href} className={styles.service} data-cta="home-services-website">
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
