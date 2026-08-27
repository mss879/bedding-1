import type { Metadata } from "next";
import { Bodoni_Moda, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { robotsFor, site } from "@/lib/site";

// Display: a high-contrast garalde that echoes the ENIVRANT wordmark.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

// Wordmark: the ENIVRANT lockup is a high-contrast didone with hairline
// strokes and flat, unbracketed serifs — Cormorant is a garalde and reads
// noticeably softer beside it. Bodoni Moda is the closest web face, so the
// hero headline is set in it and reads as an extension of the logo.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

// UI: a geometric grotesque that takes wide tracking without falling apart.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    // The default carries the categories a stranger would actually search for;
    // the brand line does the emotive work on the share card instead.
    default: `${site.name} — Luxury Fragrance, Pearls, Fashion & Fine Bedlinen`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  applicationName: site.name,
  category: "shopping",
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} — ${site.headline}`,
    description: site.shareDescription,
    url: site.url,
    siteName: site.name,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.headline}`,
    description: site.shareDescription,
  },
  robots: robotsFor(true),
  formatDetection: { telephone: false },
};

// One graph rather than three loose blobs, so the Organization can be
// referenced by @id from the store and the site instead of being repeated.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "OnlineStore"],
      "@id": `${site.url}/#organization`,
      name: site.name,
      alternateName: site.nameUpper,
      slogan: site.headline,
      description: site.description,
      url: site.url,
      email: site.email,
      telephone: site.phone,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/brand/enivrant-lockup.png`,
        width: 1034,
        height: 459,
      },
      image: `${site.url}/opengraph-image.png`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Colombo",
        addressCountry: "LK",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: site.email,
        telephone: site.phone,
        availableLanguage: ["en"],
      },
      sameAs: [site.instagram, site.facebook, site.pinterest],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      description: site.description,
      inLanguage: "en-GB",
      publisher: { "@id": `${site.url}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${site.url}/shop?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

// Storefront chrome (header, footer, cart) lives in (store)/layout.tsx; the
// admin dashboard under /admin brings its own shell.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${bodoni.variable} ${jost.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
