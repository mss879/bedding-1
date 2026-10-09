import type { Metadata } from "next";
import Link from "next/link";
import { adminListVouchers } from "@/lib/admin/data";
import { formatPrice, paymentMethodLabel } from "@/lib/site";
import type { VoucherStatus } from "@/lib/types";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { VoucherControl, VoucherStatusBadge } from "@/components/admin/VoucherControl";

export const metadata: Metadata = {
  title: "Vouchers",
};

const filters: { value?: VoucherStatus; label: string }[] = [
  { label: "All" },
  { value: "pending", label: "Awaiting payment" },
  { value: "issued", label: "Issued" },
  { value: "redeemed", label: "Redeemed" },
  { value: "void", label: "Void" },
];

const thClass = "px-4 py-3 text-left text-[0.78rem] font-semibold text-fog";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Every spa voucher sold. A spa calling to check a code is looked up here by
 * the code; marking it redeemed stops it being used twice.
 */
export default async function AdminVouchersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; code?: string }>;
}) {
  const { status: raw, code } = await searchParams;
  const status = filters.find((f) => f.value === raw)?.value;
  const vouchers = await adminListVouchers(status, code);

  const filterHref = (value?: VoucherStatus) => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (code) params.set("code", code);
    const qs = params.toString();
    return qs ? `/admin/vouchers?${qs}` : "/admin/vouchers";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Spa vouchers</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          One code per voucher bought. Card payments issue their codes automatically; a bank
          transfer&apos;s are issued when you confirm the order. When a spa checks a code, find it here
          and mark it redeemed.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={filterHref(filter.value)}
            className={`chip ${status === filter.value ? "chip-active" : ""}`}
          >
            {filter.label}
          </Link>
        ))}
        <form action="/admin/vouchers" className="ml-auto flex items-center gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="voucher-code" className="sr-only">
            Find a code
          </label>
          <input
            id="voucher-code"
            name="code"
            defaultValue={code ?? ""}
            placeholder="Find a code, e.g. ENV-7K3P"
            className="field w-56 uppercase placeholder:normal-case"
          />
          <button type="submit" className="btn btn-outline btn-sm">
            Find
          </button>
        </form>
      </div>

      {vouchers === null ? (
        <SetupNotice />
      ) : vouchers.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-card">
          <p className="font-display text-2xl text-ink">
            {code ? `No voucher matches “${code}”` : status ? "Nothing here right now" : "No vouchers sold yet"}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {code
              ? "Check the code with the guest — codes look like ENV-7K3P-2M9X."
              : "Vouchers appear here as soon as one is ordered at checkout."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-card">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b hairline">
                <th className={thClass}>Code</th>
                <th className={thClass}>Voucher</th>
                <th className={thClass}>Customer</th>
                <th className={thClass}>Order</th>
                <th className={thClass}>Value</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.code} className="border-b hairline align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[0.85rem] font-semibold tracking-wide text-ink">
                    {v.code}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{v.product_name}</p>
                    <p className="text-[0.78rem] text-fog">{v.size_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    {v.order ? (
                      <>
                        <p className="font-medium text-ink">{v.order.customer_name}</p>
                        <p className="text-[0.78rem] text-fog">{v.order.phone}</p>
                      </>
                    ) : (
                      <span className="text-fog">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {v.order ? (
                      <>
                        <Link
                          href={`/admin/orders/${v.order.id}`}
                          className="font-semibold text-ink hover:text-clay hover:underline"
                        >
                          {v.order.reference}
                        </Link>
                        <p className="text-[0.78rem] text-fog">{paymentMethodLabel(v.order.payment_method)}</p>
                      </>
                    ) : (
                      <span className="text-fog">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="text-ink">{formatPrice(v.value)} at the spa</p>
                    <p className="text-[0.78rem] text-fog">Paid {formatPrice(v.paid)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <VoucherStatusBadge status={v.status} />
                    <p className="mt-0.5 text-[0.75rem] text-fog">
                      {v.status === "redeemed" && v.redeemed_at
                        ? `on ${dateFormat.format(new Date(v.redeemed_at))}`
                        : v.status === "issued" && v.issued_at
                          ? `on ${dateFormat.format(new Date(v.issued_at))}`
                          : `ordered ${dateFormat.format(new Date(v.created_at))}`}
                    </p>
                    {v.redeemed_note && (
                      <p className="mt-0.5 max-w-[14rem] text-[0.75rem] text-ink-soft">{v.redeemed_note}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <VoucherControl code={v.code} status={v.status} />
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
