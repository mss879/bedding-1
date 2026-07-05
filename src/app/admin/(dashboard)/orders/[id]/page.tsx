import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetOrder } from "@/lib/admin/data";
import { formatPrice, paymentMethodLabel, whatsappLink } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = {
  title: "Order",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-card">
      <h2 className="font-display text-lg">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (getSupabaseAdmin() === null) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl md:text-4xl">Order</h1>
        <SetupNotice />
      </div>
    );
  }

  const result = await adminGetOrder(id);
  if (!result) notFound();
  const { order, items } = result;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-ink-soft hover:text-ink hover:underline">
          ← Orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl md:text-4xl">{order.reference}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1.5 text-sm text-ink-soft">
          Placed on {dateFormat.format(new Date(order.created_at))}
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Left: items + notes */}
        <div className="space-y-6">
          <Card title="Items">
            {items.length === 0 ? (
              <p className="text-sm text-ink-soft">No line items were recorded for this order.</p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline justify-between gap-4 border-b hairline py-3 first:pt-0 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{item.product_name}</p>
                      <p className="text-xs text-ink-soft">{item.size_name}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm text-ink-soft">
                      {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                    <p className="whitespace-nowrap font-semibold">
                      {formatPrice(item.unit_price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex items-baseline justify-between border-t hairline pt-3">
              <span className="text-sm font-medium text-ink">Total</span>
              <span className="text-lg font-semibold text-ink">{formatPrice(order.total)}</span>
            </div>
          </Card>

          {order.notes && (
            <Card title="Notes">
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {order.notes}
              </p>
            </Card>
          )}
        </div>

        {/* Right: customer, delivery, payment, status */}
        <div className="space-y-5">
          <Card title="Customer">
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-ink">{order.customer_name}</p>
              {order.email && (
                <p>
                  <a href={`mailto:${order.email}`} className="text-clay hover:underline">
                    {order.email}
                  </a>
                </p>
              )}
              <p>
                <a href={`tel:${order.phone}`} className="text-clay hover:underline">
                  {order.phone}
                </a>
              </p>
            </div>
            <a
              href={whatsappLink(`Hello ${order.customer_name}, about your order ${order.reference}`)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-tint btn-sm mt-4"
            >
              Message on WhatsApp
            </a>
          </Card>

          <Card title="Delivery">
            <p className="text-sm leading-relaxed text-ink-soft">
              {order.address}
              <br />
              {order.city}
            </p>
          </Card>

          <Card title="Payment">
            <p className="text-sm text-ink-soft">{paymentMethodLabel(order.payment_method)}</p>
          </Card>

          <Card title="Status">
            <OrderStatusControl orderId={order.id} status={order.status} />
          </Card>
        </div>
      </div>
    </div>
  );
}
