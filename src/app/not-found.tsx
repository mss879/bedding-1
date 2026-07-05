import Link from "next/link";
import { getCategories } from "@/lib/catalog";

export default async function NotFound() {
  const categories = await getCategories();

  return (
    <div className="bg-cream">
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <p className="text-[0.82rem] font-semibold text-clay">404</p>
        <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight md:text-5xl">
          This page is still at the loom.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft md:text-base">
          We couldn&apos;t find that thread — it may have been tucked away, renamed,
          or never woven at all.
        </p>
        <Link href="/" className="btn btn-solid mt-8">
          Take me home
        </Link>

        <div className="mt-12 w-full max-w-2xl">
          <p className="text-sm text-ink-soft">Or browse something soft instead</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <Link href="/shop" className="chip">
              All bedding
            </Link>
            {categories.map((c) => (
              <Link key={c.slug} href={`/shop?category=${c.slug}`} className="chip">
                {c.name}
              </Link>
            ))}
            <Link href="/hotel-bulk" className="chip">
              Hotel &amp; bulk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
