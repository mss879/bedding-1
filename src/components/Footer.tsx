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
        <div className="container-x flex flex-col items-center gap-5 py-14 text-center md:gap-6 md:py-20">
          <p className="eyebrow">The maison letter</p>
          <p className="max-w-xl font-display text-[1.75rem] leading-tight xs:text-3xl md:text-[2.6rem]">
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
              Fragrance, wellness, pearls, fashion, and bedlinen — timeless
              pieces, curated for modern elegance.
            </p>
            <div className="mt-7 flex gap-2.5">
              {[
                { href: site.instagram, label: "Instagram", Icon: InstagramIcon },
                { href: site.facebook, label: "Facebook", Icon: FacebookIcon },
                { href: site.pinterest, label: "Pinterest", Icon: PinterestIcon },
                { href: whatsappLink(`Hello ${site.name}!`), label: "WhatsApp", Icon: WhatsAppIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-linen/20 text-linen/80 transition-colors hover:border-clay hover:text-clay"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="h-[1.05rem] w-[1.05rem]" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-6 text-[0.62rem] font-medium tracking-[0.22em] uppercase text-linen/60">
              Collections
            </p>
            {/* py-1.5 rather than a list gap: the padding is part of each
                link, so a thumb has ~34px to land on instead of 21px. */}
            <ul className="-my-1.5 space-y-0.5 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className="block py-1.5 text-linen/80 transition-colors hover:text-clay"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/shop"
                  className="block py-1.5 text-linen/80 transition-colors hover:text-clay"
                >
                  Shop everything
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-6 text-[0.62rem] font-medium tracking-[0.22em] uppercase text-linen/60">
              The maison
            </p>
            <ul className="-my-1.5 space-y-0.5 text-sm">
              {[
                { href: "/about", label: "Our story" },
                { href: "/hotel-bulk", label: "Hotel & trade" },
                { href: "/contact", label: "Contact & concierge" },
                { href: "/basket", label: "Your basket" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-1.5 text-linen/80 transition-colors hover:text-clay"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-6 text-[0.62rem] font-medium tracking-[0.22em] uppercase text-linen/60">
              Reach us
            </p>
            <ul className="space-y-2 text-sm break-words text-linen/80">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-block py-1.5 transition-colors hover:text-clay"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="inline-block py-1.5 transition-colors hover:text-clay"
                >
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(`Hello ${site.name}!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-1.5 font-medium text-clay transition-colors hover:text-linen"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-linen/10">
          <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-center text-[0.7rem] leading-relaxed text-linen/55 md:flex-row md:text-left">
            <p className="flex items-center gap-2">
              <GlobeIcon className="h-3.5 w-3.5" />
              Sri Lanka&ensp;|&ensp;English (UK)&ensp;|&ensp;$ (USD)
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
            <p>365-day guarantee · Curated, never mass-produced</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 8.5V7c0-.8.2-1.2 1.3-1.2H17V3h-2.5C11.7 3 11 4.4 11 6.4v2.1H9V12h2v9h3v-9h2.3l.4-3.5H14Z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5.1s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.5-.2 1 .5 1.9 1.6 1.9 1.9 0 3.3-2 3.3-4.9 0-2.6-1.8-4.4-4.4-4.4a4.6 4.6 0 0 0-4.8 4.6c0 .9.3 1.9.8 2.4.1.1.1.2.1.3l-.3 1.1c0 .2-.1.2-.3.1-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.2 6.4-5.4 6.4-1 0-2-.5-2.4-1.2l-.6 2.5c-.2.9-.8 2-1.2 2.6A10 10 0 1 0 12 2Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5a1.7 1.7 0 0 0 .3-.4.5.5 0 0 0 0-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.1 5 5 0 0 0 1 2.7 11.4 11.4 0 0 0 4.4 3.9 14.5 14.5 0 0 0 1.5.5 3.5 3.5 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3Z" />
    </svg>
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
