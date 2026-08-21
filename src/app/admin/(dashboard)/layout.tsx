import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { adminLogout } from "@/lib/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/admin" className="inline-flex items-baseline gap-2">
      <span className={`font-display text-clay ${compact ? "text-xl" : "text-2xl"}`}>Enivrant</span>
      <span className="text-xs font-semibold text-fog">Admin</span>
    </Link>
  );
}

function ShellActions() {
  return (
    <div className="flex items-center gap-4 text-[0.85rem]">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink hover:underline"
      >
        View store
        <ExternalIcon className="h-3.5 w-3.5" />
      </a>
      <form action={adminLogout}>
        <button type="submit" className="font-medium text-ink-soft hover:text-ink hover:underline">
          Sign out
        </button>
      </form>
    </div>
  );
}

// Defense in depth: the proxy already redirects unauthenticated /admin
// requests, but the shell re-checks the cookie before rendering anything.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r hairline bg-white md:sticky md:top-0 md:flex md:h-screen">
        <div className="px-6 pb-5 pt-6">
          <Brand />
        </div>
        <AdminNav variant="sidebar" />
        <div className="mt-auto border-t hairline px-6 py-5">
          <ShellActions />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="border-b hairline bg-white md:hidden">
        <div className="flex items-center justify-between px-5 pt-4">
          <Brand compact />
          <ShellActions />
        </div>
        <AdminNav variant="chips" />
      </div>

      <main className="flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 4h6v6M20 4l-8.5 8.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" strokeLinecap="round" />
    </svg>
  );
}
