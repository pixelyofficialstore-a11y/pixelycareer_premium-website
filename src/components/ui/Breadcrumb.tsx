import Link from "next/link";

export default function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 text-sm text-navy/70">
        {items.map((i, n) => (
          <li key={i.label} className="flex items-center gap-x-2">
            {n > 0 && <span aria-hidden="true">/</span>}
            {i.href ? (
              <Link href={i.href} className="inline-block py-3 hover:text-vivid lg:py-1">
                {i.label}
              </Link>
            ) : (
              <span aria-current="page">{i.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
