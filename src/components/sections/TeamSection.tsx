import Image from "next/image";
import { SHOW_TEAM, TEAM } from "@/lib/team";

/** Renders nothing until the flag is on and real photos, names and roles exist in lib/team.ts. */
export default function TeamSection() {
  if (!SHOW_TEAM || TEAM.length === 0) return null;
  return (
    <section aria-labelledby="team-title" className="wrap pb-24 lg:pb-40">
      <h2 id="team-title" className="h2">
        Team
      </h2>
      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {TEAM.map((t) => (
          <li key={t.name}>
            <Image src={t.photo} alt={t.name} width={480} height={560} className="w-full rounded-2xl" />
            <p className="mt-4 font-semibold">{t.name}</p>
            <p className="text-sm text-navy/70">{t.role}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
