"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CvSheet from "@/components/cv/CvSheet";
import { ArrowRight } from "@/components/ui/Icons";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import styles from "./HomeProblem.module.css";

type Version = "before" | "after";

const VERSIONS = [
  {
    key: "before",
    label: "Before",
    title: "Easy to overlook.",
    image: HERO_PERSONAS.us.images.bad,
    details: ["A summary that could be anyone", "Duties instead of achievements", "Layout gets in the way"],
  },
  {
    key: "after",
    label: "After Pixely",
    title: "Your experience, made clear.",
    image: HERO_PERSONAS.us.images.good,
    details: ["A story built around your target role", "Achievements brought to the front", "Clean, ATS-friendly structure"],
  },
] as const;

function ExpandIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
    </svg>
  );
}

/** Root-homepage experiment. Deliberately independent of the shared reveal controller. */
export default function HomeProblem() {
  const [active, setActive] = useState<Version>("before");
  const [expanded, setExpanded] = useState<Version | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const expandedVersion = VERSIONS.find((version) => version.key === expanded);

  useEffect(() => {
    if (!expanded) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  return (
    <section id="problem" aria-labelledby="home-problem-title" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>The difference is clarity</p>
            <h2 id="home-problem-title" className={styles.title}>
              Your experience isn’t the problem.
              <span>How it comes across is.</span>
            </h2>
          </div>
          <p className={styles.intro}>You’ve done the work. We help recruiters see what it’s worth.</p>
        </header>

        <div className={styles.switch} role="group" aria-label="Compare resume versions">
          {VERSIONS.map((version) => (
            <button
              key={version.key}
              type="button"
              aria-pressed={active === version.key}
              aria-controls={`home-resume-${version.key}`}
              onClick={() => setActive(version.key)}
            >
              {version.label}
              {version.key === "after" && <ArrowRight size={15} />}
            </button>
          ))}
        </div>

        <div className={styles.comparison}>
          {VERSIONS.map((version) => (
            <figure
              key={version.key}
              id={`home-resume-${version.key}`}
              className={`${styles.panel} ${version.key === "after" ? styles.after : ""}`}
              data-active={active === version.key}
              aria-label={`${version.label}: ${version.title}`}
            >
              <figcaption className={styles.caption}>
                <div>
                  <p className={styles.stage}><i aria-hidden="true" />{version.label}</p>
                  <h3 className={styles.panelTitle}>{version.title}</h3>
                </div>
                <button className={styles.zoom} type="button" onClick={() => setExpanded(version.key)} aria-label={`Enlarge ${version.label.toLowerCase()} resume`} aria-haspopup="dialog">
                  <ExpandIcon />
                </button>
              </figcaption>
              <button
                type="button"
                className={styles.sheetButton}
                onClick={() => setExpanded(version.key)}
                aria-label={`Read the full ${version.label.toLowerCase()} resume`}
                aria-haspopup="dialog"
              >
                <CvSheet image={version.image} />
              </button>
              <p className={styles.readHint}>Select resume to read in full</p>
              <ul className={styles.details}>
                {version.details.map((detail) => (
                  <li key={detail}>
                    <span className={styles.marker} aria-hidden="true">
                      {version.key === "after" ? (
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m4 10 4 4 8-8" /></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10" /></svg>
                      )}
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            </figure>
          ))}
          <span className={styles.bridge} aria-hidden="true"><ArrowRight size={20} /></span>
        </div>

        <div className={styles.footer}>
          <p className={styles.reassurance}>Your experience. A clearer first impression.</p>
          <Link href="/free-cv-review" className={styles.review} data-cta="problem-free-review">
            Start with a free resume review <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="resume-reader-title" onClose={() => setExpanded(null)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
        <div className={styles.dialogHeader}>
          <div>
            <h3 id="resume-reader-title">{expandedVersion?.label} resume</h3>
            <p>Original document. Scroll to read every detail.</p>
          </div>
          <form method="dialog">
            <button type="submit" className={styles.close} aria-label="Close resume">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
            </button>
          </form>
        </div>
        <div className={styles.documentScroll} tabIndex={0} role="region" aria-label="Full-size resume, scroll horizontally and vertically to read">
          <div className={styles.fullSheet}>
            {expandedVersion && (
              <Image
                src={expandedVersion.image.src}
                width={expandedVersion.image.width}
                height={expandedVersion.image.height}
                alt={`${expandedVersion.label} resume, original full-resolution document`}
                unoptimized
              />
            )}
          </div>
        </div>
      </dialog>
    </section>
  );
}
