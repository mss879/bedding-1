import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";
import { formatPrice } from "@/lib/site";

export const metadata: Metadata = {
  title: "Order confirmed",
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; total?: string; wa?: string }>;
}) {
  const { ref, total, wa } = await searchParams;
  const totalNumber = Number(total);

  // Only trust a WhatsApp deep link, never an arbitrary redirect target.
  const whatsappHref = wa && wa.startsWith("https://wa.me/") ? wa : null;

  return (
    <div className="bg-cream pt-6 md:pt-8">
      <div className="container-x flex min-h-[72vh] items-center justify-center pb-20 md:pb-28">
        <Reveal className="w-full max-w-lg">
          <div className="card-lift p-8 text-center md:p-10">
            <span
              aria-hidden
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sale/10 text-sale"
            >
              <CheckIcon className="h-7 w-7" />
            </span>
            <p className="mt-5 text-[0.82rem] font-semibold text-clay">Order confirmed</p>
            <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
              Thank you — sleep is on the way.
            </h1>

            {ref && (
              <div className="mt-6 rounded-xl bg-cream px-5 py-4">
                <p className="text-xs text-ink-soft">Order reference</p>
                <p className="mt-1 text-lg font-semibold tracking-wide text-ink">{ref}</p>
                {Number.isFinite(totalNumber) && totalNumber > 0 && (
                  <p className="mt-0.5 text-sm text-ink-soft">Total {formatPrice(totalNumber)}</p>
                )}
              </div>
            )}

            <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-ink-soft">
              We&apos;ll confirm your order, delivery and payment details on WhatsApp
              within a few hours.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-clay w-full sm:w-auto"
                >
                  Confirm on WhatsApp now
                </a>
              )}
              <Link href="/shop" className="btn btn-solid w-full sm:w-auto">
                Back to the shop
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M4.5 12.5l5 5 10-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
