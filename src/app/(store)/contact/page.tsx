import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";
import { LineReveal } from "@/components/anim/TextReveal";
import { ParallaxImage } from "@/components/anim/ParallaxImage";
import { ContactForm } from "@/components/forms/ContactForm";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Speak to the Enivrant concierge — WhatsApp, email, phone or the contact form. A real person replies within one working day.",
};

export default function ContactPage() {
  return (
    <div className="bg-cream pt-6 md:pt-8">
      <div className="container-x pb-20 md:pb-28">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-[0.72rem] tracking-wide text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-clay">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              Contact
            </li>
          </ol>
        </nav>

        <header className="mb-10 max-w-2xl md:mb-12">
          <Reveal>
            <p className="eyebrow">Concierge</p>
          </Reveal>
          <LineReveal
            as="h1"
            animateOnMount
            delay={0.08}
            lines={["However you", "prefer to reach us."]}
            className="mt-5 font-display text-[2.5rem] leading-[1.05] xs:text-5xl md:text-6xl"
          />
          <Reveal delay={0.35}>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base">
              Sizing, a scent you can&rsquo;t place, a gemstone certificate or a
              commission of your own — ask away. A real person replies within one
              working day.
            </p>
          </Reveal>
        </header>

        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Form card */}
          <Reveal>
            <div className="card-lift p-7 sm:p-9 md:p-10">
              <h2 className="font-display text-3xl">Write to us</h2>
              <p className="mt-1.5 text-sm text-ink-soft">
                Tell us what you are after and we will take it from there.
              </p>
              <div className="mt-7">
                <ContactForm />
              </div>
            </div>
          </Reveal>

          {/* Contact details */}
          <div className="space-y-8">
            <Reveal delay={0.1}>
              <div className="rounded-sm bg-beeswax p-8">
                <h2 className="font-display text-3xl">In a hurry? WhatsApp.</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  The fastest way to reach the atelier — replies in minutes during
                  boutique hours.
                </p>
                <a
                  href={whatsappLink(`Hello ${site.name}!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-clay mt-5"
                >
                  <WhatsAppGlyph className="h-5 w-5" />
                  Message the concierge
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <ul className="space-y-5">
                <li>
                  <a href={`mailto:${site.email}`} className="group flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-tint text-clay">
                      <MailIcon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="eyebrow block">Email</span>
                      <span className="mt-1 block text-[0.95rem] text-ink transition-colors group-hover:text-clay">
                        {site.email}
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="group flex items-center gap-4"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-tint text-clay">
                      <PhoneIcon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="eyebrow block">Phone</span>
                      <span className="mt-1 block text-[0.95rem] text-ink transition-colors group-hover:text-clay">
                        {site.phone}
                      </span>
                    </span>
                  </a>
                </li>
                <li className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-tint text-clay">
                    <PinIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="eyebrow block">Atelier</span>
                    <span className="mt-1 block text-[0.95rem] leading-snug text-ink">
                      {site.addressLines[0]}, {site.addressLines[1]}
                    </span>
                  </span>
                </li>
              </ul>
            </Reveal>

            <Reveal delay={0.2}>
              <ParallaxImage
                src="/images/editorial/contact-boutique.webp"
                alt="The interior of the Enivrant boutique in Colombo"
                className="aspect-[4/5] w-full rounded-sm"
                strength={8}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4.5h3.2l1.6 4-2 1.5a12.5 12.5 0 0 0 6.2 6.2l1.5-2 4 1.6V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 6 1.5 1.5 0 0 1 5 4.5Z"
      />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M12 21s-6.8-5.7-6.8-10.3a6.8 6.8 0 1 1 13.6 0C18.8 15.3 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5a1.7 1.7 0 0 0 .3-.4.5.5 0 0 0 0-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.1 5 5 0 0 0 1 2.7 11.4 11.4 0 0 0 4.4 3.9 14.5 14.5 0 0 0 1.5.5 3.5 3.5 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}
