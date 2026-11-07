"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/Icons";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import styles from "./HomeProblem.module.css";

const before = HERO_PERSONAS.us.images.bad;
const after = HERO_PERSONAS.us.images.good;

/** An aligned, keyboard- and touch-operable before/after resume comparison. */
export default function HomeProblem() {
  const [position, setPosition] = useState(50);

  return (
    <section id="problem" aria-labelledby="home-problem-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <h2 id="home-problem-title" className={styles.title}>
              Same experience.
              <span>A stronger first read.</span>
            </h2>
            <p className={styles.intro}>
              The work was always there. See what changes when the right details lead.
            </p>
            <div className={styles.labels} aria-hidden="true">
              <span className={styles.beforeLabel}>Before</span>
              <span className={styles.afterLabel}>After Pixely</span>
            </div>
            <p className={styles.instruction}>
              Drag the line to compare
              <span className={styles.arrows} aria-hidden="true">← →</span>
            </p>
            <Link href="/free-cv-review" className={styles.review} data-cta="problem-free-review">
              Get a free resume review <ArrowRight size={17} />
            </Link>
          </div>

          <figure className={styles.comparison} style={{ "--position": `${position}%` } as CSSProperties}>
            <div className={styles.document} aria-hidden="true">
              <Image
                src={after.src}
                width={after.width}
                height={after.height}
                alt=""
                className={styles.resumeImage}
                priority={false}
                unoptimized
              />
              <div className={styles.beforeLayer}>
                <Image
                  src={before.src}
                  width={before.width}
                  height={before.height}
                  alt=""
                  className={styles.resumeImage}
                  unoptimized
                />
              </div>
              <div className={styles.divider} />
            </div>
            <figcaption className={styles.visuallyHidden}>
              Resume transformation. Move the slider left to reveal the improved version, or right to see the original.
            </figcaption>
            <label className={styles.visuallyHidden} htmlFor="resume-comparison">
              Compare original and improved resume
            </label>
            <input
              id="resume-comparison"
              className={styles.range}
              type="range"
              min="0"
              max="100"
              step="1"
              value={position}
              onChange={(event) => setPosition(Number(event.currentTarget.value))}
              aria-valuetext={`${position}% original resume visible`}
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
