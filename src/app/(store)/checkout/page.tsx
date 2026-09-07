import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Reveal } from "@/components/anim/Reveal";
import { isPaycorpConfigured } from "@/lib/paycorp/config";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Enivrant order.",
};

// Card availability is read from the environment at request time, so the page
// must not be prerendered with whatever was set at build.
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="bg-cream pt-6 md:pt-8">
      <div className="container-x pb-20 md:pb-28">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[0.8rem] text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-ink hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link href="/shop" className="hover:text-ink hover:underline">
                Shop
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li aria-current="page" className="text-ink">
              Checkout
            </li>
          </ol>
        </nav>

        <Reveal className="mb-8 max-w-2xl">
          <h1 className="font-display text-[2.2rem] xs:text-4xl md:text-5xl">Checkout</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
            Three quick steps — contact, delivery and payment. We confirm every order
            personally on WhatsApp.
          </p>
        </Reveal>

        <CheckoutForm cardEnabled={isPaycorpConfigured()} />
      </div>
    </div>
  );
}
