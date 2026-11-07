import Image from "next/image";
import Link from "next/link";
import { HERO_PERSONAS } from "@/config/heroPersonas";
import { ArrowRight } from "@/components/ui/Icons";
import { BrowserVisual, ProfileVisual } from "./ServiceVisuals";
import styles from "./HomeServices.module.css";

/** An open gallery of the three places a professional identity takes shape. */
export default function HomeServices() {
  const cv = HERO_PERSONAS.us.images.good;
  const services = [
    {
      title: "Career Documents",
      line: "ATS resumes, Europass CVs and cover letters.",
      href: "/services/ats-cv",
      link: "Explore resume writing",
      visual: (
        <div className={`${styles.artifact} ${styles.resume}`}>
          <Image
            src={cv.src}
            width={cv.width}
            height={cv.height}
            alt=""
            sizes="(min-width: 1024px) 204px, (min-width: 768px) 165px, 177px"
          />
        </div>
      ),
    },
    {
      title: "Professional Visibility",
      line: "A LinkedIn profile recruiters can find.",
      href: "/services/linkedin",
      link: "Explore LinkedIn optimization",
      visual: (
        <div className={`${styles.artifact} ${styles.profile}`}>
          <ProfileVisual />
        </div>
      ),
    },
    {
      title: "Digital Presence",
      line: "A portfolio website with your name on it.",
      href: "/services/portfolio-website",
      link: "Explore portfolio websites",
      visual: (
        <div className={`${styles.artifact} ${styles.browser}`}>
          <BrowserVisual />
        </div>
      ),
    },
  ];

  return (
    <section id="services" aria-labelledby="services-title" className={styles.section}>
      <div className="wrap">
        <h2 id="services-title" className={styles.title}>
          Three layers. <em>One brand.</em>
        </h2>
        <ul className={styles.gallery}>
          {services.map((service) => (
            <li key={service.href}>
              <Link href={service.href} className={styles.service}>
                <div className={styles.visual} aria-hidden="true">
                  {service.visual}
                </div>
                <div className={styles.copy}>
                  <h3 className={styles.name}>{service.title}</h3>
                  <p className={styles.description}>{service.line}</p>
                  <span className={styles.link}>
                    {service.link}<ArrowRight />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
