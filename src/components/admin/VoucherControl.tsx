"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeVoucher, type VoucherChange } from "@/lib/admin/actions";
import type { VoucherStatus } from "@/lib/types";

const STATUS_LABEL: Record<VoucherStatus, string> = {
  pending: "Awaiting payment",
  issued: "Issued",
  redeemed: "Redeemed",
  void: "Void",
};

const STATUS_TONE: Record<VoucherStatus, string> = {
  pending: "text-clay",
  issued: "text-sale",
  redeemed: "text-ink-soft",
  void: "text-fog line-through",
};

export function VoucherStatusBadge({ status }: { status: VoucherStatus }) {
  return <span className={`text-[0.82rem] font-semibold ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}

/**
 * The next steps for one voucher. Issuing by hand is for a voucher paid some
 * other way; redeeming records the spa honouring it, with an optional note.
 */
export function VoucherControl({ code, status }: { code: string; status: VoucherStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(change: VoucherChange, confirmText: string | null, askNote = false) {
    let note = "";
    if (askNote) {
      const answer = window.prompt(`${confirmText}\n\nA note for the record (optional), e.g. the spa and the date:`, "");
      if (answer === null) return;
      note = answer;
    } else if (confirmText && !window.confirm(confirmText)) {
      return;
    }
    startTransition(async () => {
      const result = await changeVoucher(code, change, note);
      if (result.ok) router.refresh();
      else window.alert(result.error);
    });
  }

  const button = "text-[0.82rem] font-medium hover:underline disabled:opacity-50";

  if (pending) return <span className="text-[0.82rem] text-fog">Saving…</span>;

  return (
    <span className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 whitespace-nowrap">
      {status === "pending" && (
        <button
          type="button"
          className={`${button} text-clay`}
          onClick={() => run("issue", `Issue ${code}? Do this only once the voucher has been paid for — the code works at the spa from now on.`)}
        >
          Issue
        </button>
      )}
      {status === "issued" && (
        <button
          type="button"
          className={`${button} text-clay`}
          onClick={() => run("redeem", `Mark ${code} as redeemed at the spa?`, true)}
        >
          Mark redeemed
        </button>
      )}
      {status === "redeemed" && (
        <button
          type="button"
          className={`${button} text-ink-soft`}
          onClick={() => run("unredeem", `Undo the redemption of ${code}? It becomes usable again.`)}
        >
          Undo redeem
        </button>
      )}
      {(status === "pending" || status === "issued") && (
        <button
          type="button"
          className={`${button} text-red-700`}
          onClick={() => run("void", `Void ${code}? It will no longer be honoured, and this can't be undone.`)}
        >
          Void
        </button>
      )}
    </span>
  );
}
