import type { PaymentStatus } from "@/lib/types";

/**
 * Where an order stands with the money, which is not the same question as the
 * fulfilment status next to it: a COD order ships unpaid, and a card order can
 * be paid days before it moves.
 */
const tones: Record<PaymentStatus, string> = {
  unpaid: "bg-sand text-fog",
  pending: "bg-accent-tint text-ink",
  paid: "bg-sale/10 text-sale",
  failed: "bg-clay/10 text-clay",
  cancelled: "bg-sand text-fog",
};

const labels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "Awaiting payment",
  paid: "Paid",
  failed: "Payment failed",
  cancelled: "Payment cancelled",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.78rem] font-semibold ${tones[status]}`}
    >
      {labels[status]}
    </span>
  );
}
