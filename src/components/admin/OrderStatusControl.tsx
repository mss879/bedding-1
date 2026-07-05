"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/admin/actions";
import type { OrderStatus } from "@/lib/types";

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(status);
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  function onSave() {
    setFlash(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, value);
      if (result.ok) {
        setFlash({ ok: true, text: "Saved" });
        router.refresh();
      } else {
        setFlash({ ok: false, text: result.error });
      }
    });
  }

  return (
    <div className="space-y-3">
      <label htmlFor="order-status" className="mb-1.5 block text-[0.82rem] font-semibold text-ink">
        Order status
      </label>
      <select
        id="order-status"
        className="field"
        value={value}
        onChange={(e) => {
          setValue(e.target.value as OrderStatus);
          setFlash(null);
        }}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onSave}
        disabled={pending}
        className="btn btn-solid btn-sm w-full disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {flash && (
        <p
          role={flash.ok ? "status" : "alert"}
          className={`text-sm font-medium ${flash.ok ? "text-sale" : "text-red-700"}`}
        >
          {flash.text}
        </p>
      )}
    </div>
  );
}
