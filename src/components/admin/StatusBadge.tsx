import type { OrderStatus } from "@/lib/types";

const tones: Record<OrderStatus, string> = {
  pending: "bg-accent-tint text-ink",
  confirmed: "bg-powder text-ink",
  shipped: "bg-beeswax text-ink",
  delivered: "bg-sale/10 text-sale",
  cancelled: "bg-sand text-fog",
};

const labels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.78rem] font-semibold ${tones[status]}`}
    >
      {labels[status]}
    </span>
  );
}
