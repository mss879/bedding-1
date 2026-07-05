"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  label?: string;
  confirmMessage: string;
  /** A server action pre-bound to its row id, e.g. deleteProduct.bind(null, id). */
  action: () => Promise<{ ok: boolean; error?: string }>;
};

export function DeleteButton({ label = "Delete", confirmMessage, action }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        router.refresh();
      } else {
        window.alert(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-[0.85rem] font-medium text-red-700 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
