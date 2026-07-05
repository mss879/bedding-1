import type { Metadata } from "next";
import Link from "next/link";
import { adminCounts } from "@/lib/admin/data";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "Dashboard",
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-card">
      <p className="text-[0.78rem] font-semibold text-fog">{label}</p>
      <p className="mt-1.5 font-display text-3xl text-ink">{value.toLocaleString("en-US")}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const counts = await adminCounts();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>

      {counts === null ? (
        <SetupNotice />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Pending orders" value={counts.pendingOrders} />
            <StatCard label="Total orders" value={counts.orders} />
            <StatCard label="Products" value={counts.products} />
            <StatCard label="Collections" value={counts.categories} />
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link href="/admin/orders" className="btn btn-outline btn-sm">
              View orders
            </Link>
            <Link href="/admin/products" className="btn btn-outline btn-sm">
              Manage products
            </Link>
            <Link href="/admin/collections" className="btn btn-outline btn-sm">
              Manage collections
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
