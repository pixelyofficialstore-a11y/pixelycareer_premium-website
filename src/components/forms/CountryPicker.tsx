"use client";

import { useId, useMemo, useRef, useState } from "react";
import styles from "./CountryPicker.module.css";

export const PINNED_COUNTRIES = ["UAE", "Saudi Arabia", "Qatar", "UK", "Germany", "Canada", "USA", "Pakistan", "Other Europe"];
const MORE = ["Australia", "Austria", "Bahrain", "Belgium", "Bulgaria", "China", "Croatia", "Cyprus", "Czechia", "Denmark", "Egypt", "Estonia", "Finland", "France", "Greece", "Hong Kong", "Hungary", "Iceland", "India", "Ireland", "Italy", "Japan", "Jordan", "Kuwait", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malaysia", "Malta", "Netherlands", "New Zealand", "Norway", "Oman", "Poland", "Portugal", "Romania", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Turkey", "Other"];
const ALL = [...PINNED_COUNTRIES, ...MORE];
/** EU and EEA countries (and our "Other Europe" choice): these get the Europass hint. */
const EUROPASS = new Set(["Germany", "Other Europe", "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden"]);
export const MAX_COUNTRIES = 5;

/** Searchable multi select with chips: up to five target countries, the first is the main one. */
export default function CountryPicker({ id, value, onChange, invalid }: { id: string; value: string[]; onChange: (v: string[]) => void; invalid?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const full = value.length >= MAX_COUNTRIES;
  const options = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ALL.filter((c) => !value.includes(c) && (!s || c.toLowerCase().includes(s))).slice(0, s ? 12 : ALL.length);
  }, [q, value]);
  const add = (c: string) => { if (full || value.includes(c)) return; onChange([...value, c]); setQ(""); input.current?.focus(); };
  const remove = (c: string) => onChange(value.filter((x) => x !== c));
  const europe = value.some((c) => EUROPASS.has(c));
  return (
    <div className={styles.wrap} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <div className={styles.field}>
      <div className={`${styles.box} ${invalid ? styles.invalid : ""}`} onClick={() => input.current?.focus()}>
        {value.map((c) => (
          <span key={c} className={styles.chip}>{c}<button type="button" aria-label={`Remove ${c}`} onClick={(e) => { e.stopPropagation(); remove(c); }}>×</button></span>
        ))}
        {!full && (
          <input
            ref={input} id={id} className={styles.search} value={q} placeholder={value.length ? "Add another" : "Search countries"}
            role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-invalid={invalid || undefined} autoComplete="off"
            onFocus={() => setOpen(true)} onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); if (options[0]) add(options[0]); }
              else if (e.key === "Backspace" && !q && value.length) remove(value[value.length - 1]);
              else if (e.key === "Escape") setOpen(false);
            }}
          />
        )}
      </div>
      {open && !full && options.length > 0 && (
        <ul id={listId} role="listbox" className={styles.list}>
          {options.map((c, i) => (
            <li key={c} role="option" aria-selected={false} tabIndex={-1} className={!q && i === PINNED_COUNTRIES.length - value.filter((v) => PINNED_COUNTRIES.includes(v)).length ? styles.sep : undefined}
              onMouseDown={(e) => e.preventDefault()} onClick={() => add(c)}>{c}</li>
          ))}
        </ul>
      )}
      </div>
      <p className={styles.help}>{full ? `Up to ${MAX_COUNTRIES} countries.` : "Choose up to 5. The first is your main market."}</p>
      {europe && <p className={styles.hint}>We&apos;ll use the Europass format for Europe.</p>}
    </div>
  );
}
