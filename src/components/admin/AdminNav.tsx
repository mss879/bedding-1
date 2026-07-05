"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/orders", label: "Orders", icon: ReceiptIcon },
  { href: "/admin/products", label: "Products", icon: TagIcon },
  { href: "/admin/collections", label: "Collections", icon: GridIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ variant }: { variant: "sidebar" | "chips" }) {
  const pathname = usePathname();

  if (variant === "chips") {
    return (
      <nav aria-label="Admin" className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`chip shrink-0 ${isActive(pathname, link.href) ? "chip-active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Admin" className="flex flex-col gap-1 px-3">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9rem] transition-colors ${
              active
                ? "bg-cream font-semibold text-ink"
                : "text-ink-soft hover:bg-cream/60 hover:text-ink"
            }`}
          >
            <link.icon className="h-4.5 w-4.5 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M6 3.5h12V21l-2.4-1.6L13.2 21l-2.4-1.6L8.4 21 6 19.4V3.5Z" strokeLinejoin="round" />
      <path d="M9.5 8.5h5M9.5 12h5" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path
        d="M4 4h7.2a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-5.2 5.2a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 4 11.2V4Z"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}
