"use client";

import { useEffect, useState } from "react";
import { WhatsApp } from "./Icons";
import { WHATSAPP_URL } from "@/lib/site";
import styles from "./HomeWhatsApp.module.css";

export default function HomeWhatsApp() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 400);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return visible ? <a className={styles.button} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" data-cta="home-floating-whatsapp"><WhatsApp size={26} /></a> : null;
}
