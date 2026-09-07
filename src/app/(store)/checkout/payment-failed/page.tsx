import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";
import { robotsFor, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Payment not completed",
  robots: robotsFor(false),
};

/**
 * Where a card payment lands when it doesn't go through. The basket is left
 * untouched on purpose — the shopper can go straight back to checkout and try
 * again, or switch to cash on delivery, without rebuilding it.
 */
const reasons: Record<string, { heading: string; body: string }> = {
  declined: {
    heading: "Your card was declined",
    body: "The bank didn't approve the payment. Nothing has been charged — try another card, or choose cash on delivery.",
  },
  expired: {
    heading: "Your payment session timed out",
    body: "The payment page closed before the card went through. Nothing has been charged and your basket is exactly as you left it.",
  },
  cancelled: {
    heading: "Payment cancelled",
    body: "You left the payment page before it completed. Nothing has been charged and your basket is exactly as you left it.",
  },
  gateway: {
    heading: "We couldn't confirm your payment",
    body: "The payment gateway didn't give us an answer. If your bank shows a charge, send us your order reference on WhatsApp and we'll sort it out straight away.",
  },
  mismatch: {
    heading: "We couldn't confirm your payment",
    body: "The amount that came back didn't match your order, so we've held it for review rather than confirming it. Please send us your order reference on WhatsApp.",
  },
  unknown: {
    heading: "This payment session has expired",
    body: "Payment sessions are short-lived for security. Nothing has been charged — please place your order again.",
  },
  missing: {
    heading: "This payment session has expired",
    body: "Payment sessions are short-lived for security. Nothing has been charged — please place your order again.",
  },
  unavailable: {
    heading: "Card payment is unavailable",
    body: "Card payments are temporarily switched off. Nothing has been charged — cash on delivery and bank transfer are still available.",
  },
};

const fallback = {
  heading: "Your payment didn't go through",
  body: "Nothing has been charged. Please try again, or choose another payment method at checkout.",
};

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; ref?: string }>;
}) {
  const { reason, ref } = await searchParams;
  const copy = (reason && reasons[reason]) || fallback;
  // Only "we may have your money" cases warrant nudging the customer to us.
  const needsUs = reason === "gateway" || reason === "mismatch";

  const message = ref
    ? `Hello ${site.name}, my card payment for order ${ref} didn't complete. Could you help?`
    : `Hello ${site.name}, my card payment didn't complete. Could you help?`;

  return (
    <div className="bg-cream pt-6 md:pt-8">
      <div className="container-x flex min-h-[72vh] items-center justify-center pb-20 md:pb-28">
        <Reveal className="w-full max-w-lg">
          <div className="card-lift p-8 text-center md:p-10">
            <span
              aria-hidden
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clay/10 text-clay"
            >
              <AlertIcon className="h-7 w-7" />
            </span>
            <p className="mt-5 text-[0.82rem] font-semibold text-clay">Payment not completed</p>
            <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">{copy.heading}</h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">{copy.body}</p>

            {ref && (
              <div className="mt-6 rounded-xl bg-cream px-5 py-4">
                <p className="text-xs text-ink-soft">Order reference</p>
                <p className="mt-1 text-lg font-semibold tracking-wide text-ink">{ref}</p>
              </div>
            )}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/checkout" className="btn btn-solid w-full sm:w-auto">
                Back to checkout
              </Link>
              <a
                href={whatsappLink(message)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full sm:w-auto ${needsUs ? "btn btn-clay" : "btn btn-outline"}`}
              >
                Message us on WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M12 8v5" strokeLinecap="round" />
      <path d="M12 16.5v.01" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
