import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";
import { LineReveal } from "@/components/anim/TextReveal";
import { FREE_DELIVERY_FROM, formatPrice, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that apply to every Enivrant order — payment, delivery, cancellations, returns and refunds, the 365-day guarantee and how we look after your details.",
  alternates: { canonical: "/terms" },
};

/**
 * Every order is bound by the version live when it was placed — checkout makes
 * the shopper accept this page before paying — so bump this whenever a clause
 * changes.
 */
const LAST_UPDATED = "11 September 2026";

const linkClass =
  "text-ink underline decoration-clay/60 underline-offset-4 transition-colors hover:text-clay";

function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-2.5 pl-5 marker:text-clay">{children}</ul>;
}

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="pt-3 text-[0.7rem] font-medium tracking-[0.18em] text-ink uppercase">
      {children}
    </h3>
  );
}

// The footer deep-links to #returns and #privacy, so keep those two ids if the
// clauses are ever reordered or renamed.
const clauses: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <>
        <p>
          These terms apply to every order placed with {site.name} through this
          website. {site.name} is a curated luxury house based in Colombo, Sri
          Lanka; “we”, “us” and “our” mean {site.name}, and “you” means the
          person placing the order.
        </p>
        <p>
          Please read them before you place an order. At checkout you will be
          asked to confirm that you have read and accept them, and we cannot
          take an order without that confirmation.
        </p>
        <p>
          We may update these terms from time to time. The version on this page
          when you place your order is the one that applies to it. Nothing in
          these terms affects your statutory rights as a consumer.
        </p>
      </>
    ),
  },
  {
    id: "orders",
    title: "Orders & acceptance",
    body: (
      <>
        <p>
          Placing an order is an offer to buy. We confirm every order
          personally — usually on WhatsApp, within a few hours — and our
          contract with you is formed when we do.
        </p>
        <p>
          We may decline or cancel an order if a piece has become unavailable,
          if a price or description was shown in error, or if we cannot verify
          the order or its payment. If that happens we will tell you promptly
          and refund anything you have paid, in full.
        </p>
        <p>
          Hotel, trade and bulk orders are quoted individually through our{" "}
          <Link href="/hotel-bulk" className={linkClass}>
            hotel &amp; trade
          </Link>{" "}
          service and may carry terms of their own.
        </p>
      </>
    ),
  },
  {
    id: "pieces",
    title: "About our pieces",
    body: (
      <>
        <p>
          Every piece we offer is sourced through our partnerships with select
          manufacturers and suppliers, and we stand behind its authenticity.
        </p>
        <p>
          We take care to show each piece faithfully, but colours vary slightly
          from screen to screen, and natural materials — pearls, gemstones,
          linen, botanical ingredients — differ subtly from one piece to the
          next. That variation is part of their character, not a fault. Sizes
          and measurements are approximate; if you need certainty, ask the
          concierge before ordering.
        </p>
      </>
    ),
  },
  {
    id: "pricing",
    title: "Prices & currency",
    body: (
      <>
        <p>
          Prices are shown and charged in US dollars (USD). The price that
          applies is the one shown at checkout when you place your order.
        </p>
        <p>
          If your card is billed in another currency — Sri Lankan rupees, for
          example — your bank converts the amount at its own exchange rate and
          may add fees of its own. Those are set by your bank, not by{" "}
          {site.name}, and the same applies to any refund.
        </p>
        <p>
          Delivery within Sri Lanka is complimentary on orders of{" "}
          {formatPrice(FREE_DELIVERY_FROM)} or more. On smaller orders, and on
          orders sent outside Sri Lanka, any delivery charge is confirmed with
          you before your order is dispatched.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    title: "Payment",
    body: (
      <>
        <p>You can pay in any of three ways:</p>
        <List>
          <li>
            <strong className="font-medium text-ink">By card.</strong>{" "}
            Card payments are taken on Commercial Bank of Ceylon’s secure
            payment page. You enter your card details directly with the bank —{" "}
            {site.name} never sees or stores them. A card order is confirmed
            once the bank approves the payment; if it is declined, or you leave
            the payment page, nothing is charged and you can try again or choose
            another method.
          </li>
          <li>
            <strong className="font-medium text-ink">Cash on delivery.</strong>{" "}
            Pay the courier in cash when your order arrives.
          </li>
          <li>
            <strong className="font-medium text-ink">Direct bank transfer.</strong>{" "}
            Our account details are shown once you place your order. Use your
            order reference as the payment note; we dispatch as soon as the
            transfer clears.
          </li>
        </List>
      </>
    ),
  },
  {
    id: "delivery",
    title: "Delivery",
    body: (
      <>
        <p>
          We deliver island-wide across Sri Lanka. Orders are dispatched from
          our Colombo boutique within 2–4 working days — for bank transfers,
          once the transfer has cleared — and we confirm the delivery date with
          you personally on WhatsApp. For delivery outside Sri Lanka, please
          speak to the concierge before ordering.
        </p>
        <p>
          Please make sure someone can receive the order at the address you
          give us. Responsibility for it passes to you once it has been
          delivered.
        </p>
      </>
    ),
  },
  {
    id: "returns",
    title: "Cancellations, returns & refunds",
    body: (
      <>
        <Subhead>Cancelling an order</Subhead>
        <p>
          You can cancel an order at any time before it is dispatched, for a
          full refund. Message the concierge on WhatsApp or email{" "}
          <a href={`mailto:${site.email}`} className={linkClass}>
            {site.email}
          </a>{" "}
          with your order reference.
        </p>

        <Subhead>Exchanges</Subhead>
        <p>
          If a piece is not quite right, you may exchange it within 30 days of
          delivery, provided it is unworn and unused, with its tags attached and
          in its original packaging.
        </p>
        <p>
          For reasons of hygiene, fragrances, wellness and self-care products,
          and pierced earrings can be exchanged only if unopened, with their
          seals intact. Bedlinen and sleepwear that have been used or washed,
          and pieces made, altered or engraved to your order, cannot be
          exchanged unless they are faulty.
        </p>

        <Subhead>Damaged, faulty or incorrect pieces</Subhead>
        <p>
          If a piece arrives damaged or faulty, or is not what you ordered, tell
          us within 7 days of delivery — a photograph helps. We will replace it
          or refund you in full, including any delivery charge, and arrange its
          return at our cost.
        </p>

        <Subhead>How refunds are paid</Subhead>
        <p>
          Refunds go back to your original payment method. Card payments are
          refunded to the same card through Commercial Bank of Ceylon;
          cash-on-delivery and bank-transfer payments are refunded by bank
          transfer to an account you nominate.
        </p>
        <p>
          We issue approved refunds within 7 working days. Your bank may take a
          further 5–10 working days to show a card refund on your statement.
        </p>

        <Subhead>Starting a return</Subhead>
        <p>
          Contact the concierge with your order reference — it begins
          “EN-” — before sending anything back, and we will arrange
          the return with you.
        </p>
      </>
    ),
  },
  {
    id: "guarantee",
    title: "The 365-day guarantee",
    body: (
      <>
        <p>
          Every piece carries our 365-day guarantee. If, within 365 days of
          delivery, a piece does not hold up in normal use — a fault in its
          materials or its making — the concierge will put it right with a
          repair or a replacement or, where neither is possible, a refund.
        </p>
        <p>
          The guarantee does not cover ordinary wear and tear, accidental
          damage, alterations made elsewhere, or damage from not following the
          care guidance supplied with a piece. Fragrances and wellness products
          are guaranteed authentic and in perfect condition on arrival; once
          opened, they are covered for manufacturing faults only.
        </p>
        <p>
          To make a claim, contact the concierge with your order reference and a
          photograph of the issue.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "Your privacy",
    body: (
      <>
        <p>
          When you place an order we collect your name, email address, phone
          number, delivery address and the details of what you ordered. If you
          write to us or join the maison letter, we keep what you send us.
        </p>
        <p>
          We use these details to process, deliver and look after your order —
          including contacting you about it on WhatsApp, by phone or by email —
          to honour the guarantee, and to keep the records the law requires. We
          send the maison letter only to people who have asked for it.
        </p>
        <p>
          Card details are entered on Commercial Bank of Ceylon’s payment
          page and never reach us. From the bank we receive only the result of
          the payment — with its reference, the card type and a masked card
          number — which we keep to reconcile your order.
        </p>
        <p>
          We share your details only with those who need them to fulfil your
          order — the courier delivering it and the bank processing your
          payment — and with the providers who host this website and our order
          records. We never sell your details.
        </p>
        <p>
          This website keeps your basket in your own browser so it survives a
          refresh, and uses only the cookies needed for the site and its
          payments to work. We do not use advertising or tracking cookies.
        </p>
        <p>
          You can ask for a copy of the details we hold about you, ask us to
          correct them, or ask us to delete them where we are not required to
          keep them — write to{" "}
          <a href={`mailto:${site.email}`} className={linkClass}>
            {site.email}
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    body: (
      <>
        <p>
          We are responsible for loss or damage you suffer that is a
          foreseeable result of our breaking these terms or failing to use
          reasonable care and skill. We are not responsible for loss that was
          not foreseeable, for business losses, or for delays caused by events
          beyond our reasonable control.
        </p>
        <p>
          Our total responsibility for any order is limited to the amount you
          paid for it, except where the law does not allow such a limit.
          Nothing in these terms limits our liability for death or personal
          injury caused by our negligence, for fraud, or for anything else that
          cannot be limited by law.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of Sri Lanka, and the courts of Sri
        Lanka have jurisdiction over any dispute arising from them. We would
        always rather resolve a concern with you directly, so please speak to
        the concierge first.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <p>For anything about an order, a return or these terms:</p>
        <List>
          <li>
            Email{" "}
            <a href={`mailto:${site.email}`} className={linkClass}>
              {site.email}
            </a>
          </li>
          <li>
            Phone{" "}
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className={linkClass}>
              {site.phone}
            </a>
          </li>
          <li>
            WhatsApp{" "}
            <a
              href={whatsappLink(`Hello ${site.name}! I have a question about your terms.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              message the concierge
            </a>
          </li>
        </List>
        <p>{site.name}, Colombo, Sri Lanka.</p>
      </>
    ),
  },
];

function numeral(i: number) {
  return String(i + 1).padStart(2, "0");
}

export default function TermsPage() {
  return (
    <div className="bg-cream pt-6 md:pt-8">
      <div className="container-x pb-20 md:pb-28">
        <nav aria-label="Breadcrumb" className="mb-8 text-[0.72rem] tracking-wide text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-clay">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              Terms &amp; Conditions
            </li>
          </ol>
        </nav>

        <header className="mb-12 max-w-2xl md:mb-16">
          <Reveal>
            <p className="eyebrow">Client care</p>
          </Reveal>
          <LineReveal
            as="h1"
            animateOnMount
            delay={0.08}
            lines={["Terms &", "Conditions"]}
            className="mt-5 font-display text-[2.5rem] leading-[1.05] xs:text-5xl md:text-6xl"
          />
          <Reveal delay={0.35}>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base">
              The terms that apply whenever you shop with {site.name} — ordering,
              payment, delivery, returns and refunds, the 365-day guarantee and
              how we look after your details. Please read them before you place
              an order.
            </p>
            <p className="mt-4 text-[0.72rem] tracking-wide text-fog">
              Last updated {LAST_UPDATED}
            </p>
          </Reveal>
        </header>

        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20">
          {/* Index: a boxed list on phones, a sticky rail beside the text on
              desktop — same offset as the basket summary, clear of the header. */}
          <nav
            aria-label="On this page"
            className="h-fit border hairline bg-white p-5 lg:sticky lg:top-44 lg:border-0 lg:bg-transparent lg:p-0"
          >
            <p className="eyebrow">On this page</p>
            <ol className="mt-3 grid gap-y-0.5 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-1">
              {clauses.map((clause, i) => (
                <li key={clause.id}>
                  <a
                    href={`#${clause.id}`}
                    className="flex gap-3 py-1.5 text-[0.85rem] leading-snug text-ink-soft transition-colors hover:text-ink"
                  >
                    <span className="w-5 shrink-0 font-display italic text-clay">
                      {numeral(i)}
                    </span>
                    {clause.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-3xl">
            {clauses.map((clause, i) => (
              <section
                key={clause.id}
                id={clause.id}
                aria-labelledby={`${clause.id}-title`}
                // Anchor jumps land below the sticky header, not under it —
                // 162px on a phone before its announcement rail rolls up.
                className="scroll-mt-48 border-t hairline py-10 first:border-t-0 first:pt-0 md:py-12"
              >
                <p className="font-display text-xl italic text-clay">{numeral(i)}</p>
                <h2
                  id={`${clause.id}-title`}
                  className="mt-1 font-display text-[1.75rem] leading-tight md:text-[2rem]"
                >
                  {clause.title}
                </h2>
                <div className="mt-5 space-y-4 text-[0.95rem] leading-[1.85] text-ink-soft">
                  {clause.body}
                </div>
              </section>
            ))}

            <p className="border-t hairline pt-10 font-display text-xl italic text-clay">
              {site.name} — {site.tagline}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
