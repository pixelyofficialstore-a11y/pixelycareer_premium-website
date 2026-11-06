import Link from "next/link";
import { ArrowRight } from "@/components/ui/Icons";

export const metadata = { title: { absolute: "Page not found | Pixely Careers" }, robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="page-top wrap flex min-h-[70svh] flex-col justify-center pb-24">
      <h1 className="page-h1 max-w-[16ch]">This page took a different career path.</h1>
      <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8">
        <Link href="/" className="btn btn-primary min-h-14 px-8 text-[1.0625rem]">
          Back to home
          <ArrowRight />
        </Link>
        <Link href="/pricing" className="link-u font-head font-medium">
          See packages
          <ArrowRight />
        </Link>
      </div>
    </section>
  );
}
