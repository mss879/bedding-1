import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { site, whatsappLink } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer>
      {/* Newsletter band */}
      <div className="bg-beeswax">
        <div className="container-x flex flex-col items-center gap-6 py-16 text-center md:py-20">
          <p className="eyebrow">The maison letter</p>
          <p className="max-w-xl font-display text-3xl leading-tight md:text-[2.6rem]">
            New compositions, private previews and the occasional invitation.
          </p>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="bg-ink text-linen">
        <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/brand/enivrant-wordmark-white.png"
              alt={site.nameUpper}
              width={1002}
              height={155}
              className="h-[19px] w-auto"
            />
            <p className="mt-3 text-[0.6rem] font-medium tracking-[0.3em] uppercase text-linen/50">
              {site.tagline}
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-linen/70">
              Fragrance, wellness, fine pearls, fashion and bedlinen — composed,
              set and sewn by hand in our Colombo atelier.
            </p>
            <div className="mt-7 flex gap-2.5">
              {[
                { href: site.instagram, label: "Instagram" },
                { href: site.facebook, label: "Facebook" },
                { href: site.pinterest, label: "Pinterest" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-linen/20 text-[0.6rem] tracking-wider transition-colors hover:border-clay hover:text-clay"
                  aria-label={s.label}
                >
                  {s.label[0]}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-6 text-[0.62rem] font-medium tracking-[0.22em] uppercase text-linen/60">
              Collections
            </p>
            <ul className="space-y-3.5 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className="text-linen/80 transition-colors hover:text-clay"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="text-linen/80 transition-colors hover:text-clay">
                  Shop everything
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-6 text-[0.62rem] font-medium tracking-[0.22em] uppercase text-linen/60">
              The maison
            </p>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/about" className="text-linen/80 transition-colors hover:text-clay">
                  Our story
                </Link>
              </li>
              <li>
                <Link href="/hotel-bulk" className="text-linen/80 transition-colors hover:text-clay">
                  Hotel &amp; trade
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-linen/80 transition-colors hover:text-clay">
                  Contact &amp; concierge
                </Link>
              </li>
              <li>
                <Link href="/basket" className="text-linen/80 transition-colors hover:text-clay">
                  Your basket
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-6 text-[0.62rem] font-medium tracking-[0.22em] uppercase text-linen/60">
              Reach us
            </p>
            <ul className="space-y-3.5 text-sm text-linen/80">
              {site.addressLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li>
                <a href={`mailto:${site.email}`} className="transition-colors hover:text-clay">
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-clay"
                >
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(`Hello ${site.name}!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-clay transition-colors hover:text-linen"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-linen/10">
          <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-[0.7rem] text-linen/55 md:flex-row">
            <p className="flex items-center gap-2">
              <GlobeIcon className="h-3.5 w-3.5" />
              Sri Lanka&ensp;|&ensp;English (UK)&ensp;|&ensp;Rs (LKR)
            </p>
            <p>
              © {new Date().getFullYear()} {site.nameUpper}. All rights reserved.
              {" · "}
              <a
                href="https://www.arcai.agency"
                target="_blank"
                rel="noopener"
                title="Arcai Agency — web design & development"
                className="text-linen/75 underline underline-offset-4 transition-colors hover:text-clay"
              >
                Built &amp; designed by Arcai Agency
              </a>
            </p>
            <p>365-day guarantee · Made by hand</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}
