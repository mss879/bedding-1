import Link from "next/link";
import type { Category } from "@/lib/types";
import { site, whatsappLink } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer>
      {/* Newsletter capture band — Etsy's "Yes! Send me exclusive offers" strip */}
      <div className="bg-beeswax">
        <div className="container-x flex flex-col items-center gap-5 py-12 text-center">
          <p className="font-display text-2xl md:text-3xl">
            Yes! Send me home ideas, care guides &amp; private offers.
          </p>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="bg-ink text-linen">
        <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-3xl lowercase text-clay">{site.name}</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.3em] text-linen/60">
              {site.tagline}
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-linen/70">
              Honest, handmade goods for every room of the house — designed, made
              and finished by hand in our Colombo workshop.
            </p>
          </div>

          <div>
            <p className="mb-5 text-sm font-semibold">Shop</p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/shop" className="text-linen/80 transition-colors hover:text-linen hover:underline">
                  Everything
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className="text-linen/80 transition-colors hover:text-linen hover:underline"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-5 text-sm font-semibold">Company</p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-linen/80 transition-colors hover:text-linen hover:underline">
                  Our story
                </Link>
              </li>
              <li>
                <Link href="/hotel-bulk" className="text-linen/80 transition-colors hover:text-linen hover:underline">
                  Hotel &amp; trade orders
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-linen/80 transition-colors hover:text-linen hover:underline">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-5 text-sm font-semibold">Help</p>
            <ul className="space-y-3 text-sm text-linen/80">
              {site.addressLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li>
                <a href={`mailto:${site.email}`} className="transition-colors hover:text-linen hover:underline">
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-linen hover:underline"
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
          <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-linen/60 md:flex-row">
            <p className="flex items-center gap-2">
              <GlobeIcon className="h-3.5 w-3.5" />
              Sri Lanka&ensp;|&ensp;English (UK)&ensp;|&ensp;Rs (LKR)
            </p>
            <p>
              © {new Date().getFullYear()} {site.name} {site.tagline}. All rights reserved.
              {" · "}
              <a
                href="https://www.arcai.agency"
                target="_blank"
                rel="noopener"
                title="Arcai Agency — web design & development"
                className="text-linen/80 underline underline-offset-4 transition-colors hover:text-clay"
              >
                Built &amp; designed by Arcai Agency
              </a>
            </p>
            <p>365-day guarantee · Made by hand · Fair prices</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}
