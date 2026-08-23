import Link from "next/link";
import { getNavCategories } from "@/lib/catalog";
import { CartProvider } from "@/components/cart/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// The root not-found renders inside the root layout only (store chrome lives
// in the (store) group), so it composes the header/footer itself.
export default async function NotFound() {
  const categories = await getNavCategories();

  return (
    <CartProvider>
      <Header categories={categories} />
      <main className="flex-1 bg-cream">
        <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-4 max-w-xl font-display text-[2.5rem] leading-[1.05] xs:text-5xl md:text-6xl">
            This page is still on the bench.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft md:text-base">
            We could not find that piece — it may have been moved, renamed, or
            never made at all.
          </p>
          <Link href="/" className="btn btn-solid mt-8">
            Back to the maison
          </Link>

          <div className="mt-12 w-full max-w-2xl">
            <p className="eyebrow">Or browse the collections</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              <Link href="/shop" className="chip">
                Everything
              </Link>
              {categories.map((c) => (
                <Link key={c.slug} href={`/shop?category=${c.slug}`} className="chip">
                  {c.name}
                </Link>
              ))}
              <Link href="/hotel-bulk" className="chip">
                Hotel &amp; trade
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer categories={categories} />
    </CartProvider>
  );
}
