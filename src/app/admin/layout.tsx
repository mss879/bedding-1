import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Bare wrapper for everything under /admin. The login page renders directly
// inside it; the dashboard route group adds the sidebar shell on top.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen w-full bg-cream">{children}</div>;
}
