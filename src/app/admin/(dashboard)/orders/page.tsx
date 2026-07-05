import type { Metadata } from "next";
import Link from "next/link";
import { adminListOrders } from "@/lib/admin/data";
import { formatPrice, paymentMethodLabel } from "@/lib/site";
import type { OrderStatus } from "@/lib/types";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = {
  title: "Orders",
};

const filters: { value?: OrderStatus; label: string }[] = [
  { label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const thClass = "px-4 py-3 text-left text-[0.78rem] font-semibold text-fog";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: raw } = await searchParams;
  const status = filters.find((f) => f.value === raw)?.value;
  const orders = await adminListOrders(status);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl md:text-4xl">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={filter.value ? `/admin/orders?status=${filter.value}` : "/admin/orders"}
            className={`chip ${status === filter.value ? "chip-active" : ""}`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {orders === null ? (
        <SetupNotice />
      ) : orders.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-card">
          <p className="font-display text-2xl text-ink">
            {status ? `No ${status} orders` : "No orders yet"}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {status
              ? "Nothing matches this filter right now."
              : "Orders placed at checkout appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b hairline">
                <th className={thClass}>Reference</th>
                <th className={thClass}>Date</th>
                <th className={thClass}>Customer</th>
                <th className={thClass}>Total</th>
                <th className={thClass}>Payment</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hairline last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-ink hover:text-clay hover:underline"
                    >
                      {order.reference}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                    {dateFormat.format(new Date(order.created_at))}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{order.customer_name}</p>
                    <p className="text-[0.78rem] text-fog">{order.phone}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                    {paymentMethodLabel(order.payment_method)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
