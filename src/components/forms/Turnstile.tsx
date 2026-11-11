"use client";
import { useEffect, useRef } from "react";

type TS = { render: (el: HTMLElement, o: Record<string, unknown>) => string; remove: (id: string) => void; reset: (id: string) => void };
export type TsStatus = "checking" | "ok" | "failed";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

let loading: Promise<void> | null = null;
function load() {
  if ((window as unknown as { turnstile?: TS }).turnstile) return Promise.resolve();
  loading ??= new Promise<void>((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => res();
    s.onerror = () => { loading = null; rej(); };
    document.head.appendChild(s);
  });
  return loading;
}

/** Cloudflare Turnstile (managed, usually invisible). Calls onToken with a fresh token, or "" when it expires. */
export default function Turnstile({ onToken, onStatus, retry = 0 }: { onToken: (t: string) => void; onStatus?: (s: TsStatus) => void; retry?: number }) {
  const st = useRef(onStatus);
  st.current = onStatus;
  const wid = useRef("");
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  cb.current = onToken;
  useEffect(() => {
    if (!SITE_KEY) { st.current?.("ok"); return; }
    st.current?.("checking");
    let id = "";
    let gone = false;
    load().then(() => {
      const ts = (window as unknown as { turnstile?: TS }).turnstile;
      if (gone || !ts || !box.current) return;
      id = ts.render(box.current, {
        sitekey: SITE_KEY, appearance: "interaction-only",
        callback: (t: string) => { cb.current(t); st.current?.("ok"); },
        "expired-callback": () => { cb.current(""); st.current?.("checking"); },
        "error-callback": () => { cb.current(""); st.current?.("failed"); },
        "refresh-expired": "auto",
      });
      wid.current = id;
    }).catch(() => { st.current?.("failed"); });
    return () => { gone = true; if (id) (window as unknown as { turnstile?: TS }).turnstile?.remove(id); };
  }, []);
  useEffect(() => {
    if (!retry || !wid.current) return;
    st.current?.("checking");
    cb.current("");
    (window as unknown as { turnstile?: TS }).turnstile?.reset(wid.current);
  }, [retry]);
  return <div ref={box} style={{ minHeight: 0 }} />;
}
