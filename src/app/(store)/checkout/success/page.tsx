import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { bankDetails, formatPrice, robotsFor, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Order confirmed",
  // Every value on this page comes from the query string, so a crafted variant
  // must never be indexable. /checkout/payment-failed does the same.
  robots: robotsFor(false),
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; total?: string; wa?: string; pm?: string; txn?: string }>;
}) {
  const { ref, total, wa, pm, txn } = await searchParams;
  const totalNumber = Number(total);
  const hasTotal = Number.isFinite(totalNumber) && totalNumber > 0;
  const isBankTransfer = pm === "bank_transfer";
  // Card orders only reach this page through the Paycorp return handler, which
  // has already verified the payment server-side.
  const isCard = pm === "card";

  // Pin the number, not just the host. Checking only the `https://wa.me/`
  // prefix fixed the destination host but left the phone number free, so a
  // crafted link could point this page's primary button at someone else's
  // WhatsApp while everything around it still read as a genuine confirmation
  // on our own domain — a ready-made payment-redirection pretext.
  const whatsappBase = `https://wa.me/${site.whatsappNumber}`;
  const whatsappHref =
    wa && (wa === whatsappBase || wa.startsWith(`${whatsappBase}?`)) ? wa : null;

  return (
    <div className="bg-cream pt-6 md:pt-8">
      <div className="container-x flex min-h-[72vh] items-center justify-center pb-20 md:pb-28">
        {/* Only an order that actually carries a reference empties the basket,
            so a stray or crafted link to this page cannot silently clear it. */}
        {ref && <ClearCartOnMount />}
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
              Thank you — your pieces are on the way.
            </h1>

            {ref && (
              <div className="mt-6 rounded-xl bg-cream px-5 py-4">
                <p className="text-xs text-ink-soft">Order reference</p>
                <p className="mt-1 text-lg font-semibold tracking-wide text-ink">{ref}</p>
                {hasTotal && (
                  <p className="mt-0.5 text-sm text-ink-soft">Total {formatPrice(totalNumber)}</p>
                )}
                {isCard && txn && (
                  <p className="mt-2 border-t hairline pt-2 text-xs text-ink-soft">
                    Payment reference{" "}
                    <span className="font-semibold tracking-wide text-ink">{txn}</span>
                  </p>
                )}
              </div>
            )}

            {isCard ? (
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
                {hasTotal ? (
                  <>
                    Your card payment of{" "}
                    <span className="font-semibold text-ink">{formatPrice(totalNumber)}</span> went
                    through. A receipt is on its way from your bank.
                  </>
                ) : (
                  <>Your card payment went through. A receipt is on its way from your bank.</>
                )}
              </p>
            ) : isBankTransfer ? (
              <div className="mt-4 rounded-xl bg-cream px-5 py-5 text-left">
                <h2 className="font-display text-xl">Complete your payment</h2>
                <dl className="mt-4 space-y-2.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[0.82rem] font-semibold text-ink-soft">Bank</dt>
                    <dd className="text-right text-sm font-semibold text-ink">{bankDetails.bankName}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[0.82rem] font-semibold text-ink-soft">Account name</dt>
                    <dd className="text-right text-sm font-semibold text-ink">{bankDetails.accountName}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[0.82rem] font-semibold text-ink-soft">Account number</dt>
                    <dd className="text-right text-sm font-semibold tracking-wide text-ink">
                      {bankDetails.accountNumber}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[0.82rem] font-semibold text-ink-soft">Branch</dt>
                    <dd className="text-right text-sm font-semibold text-ink">{bankDetails.branch}</dd>
                  </div>
                  {hasTotal && (
                    <div className="flex items-baseline justify-between gap-4 border-t hairline pt-2.5">
                      <dt className="text-[0.82rem] font-semibold text-ink-soft">Amount</dt>
                      <dd className="text-right text-sm font-semibold text-sale">{formatPrice(totalNumber)}</dd>
                    </div>
                  )}
                </dl>
                {ref && (
                  <p className="mt-4 text-xs leading-relaxed text-ink-soft">
                    Use your order reference <span className="font-semibold text-ink">{ref}</span> as the
                    payment note — we dispatch as soon as the transfer clears.
                  </p>
                )}
              </div>
            ) : (
              hasTotal && (
                <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
                  Keep <span className="font-semibold text-ink">{formatPrice(totalNumber)}</span> ready in
                  cash — the courier collects on delivery.
                </p>
              )
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
                  {isBankTransfer
                    ? "Send us the transfer slip on WhatsApp"
                    : isCard
                      ? "Say hello on WhatsApp"
                      : "Confirm on WhatsApp now"}
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
