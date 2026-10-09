import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteSubcategory } from "@/lib/admin/actions";
import {
  adminCountProductsBySubcategory,
  adminGetCategory,
  adminListSubcategories,
} from "@/lib/admin/data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ImageThumb } from "@/components/admin/ImageThumb";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "Edit collection",
};

const thClass = "px-4 py-3 text-left text-[0.78rem] font-semibold text-fog";

export default async function AdminEditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (getSupabaseAdmin() === null) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl md:text-4xl">Edit collection</h1>
        <SetupNotice />
      </div>
    );
  }

  const category = await adminGetCategory(id);
  if (!category) notFound();

  const [subcategories, counts] = await Promise.all([
    adminListSubcategories(category.slug),
    adminCountProductsBySubcategory(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Edit collection</h1>
        <p className="mt-1.5 text-sm text-ink-soft">{category.name}</p>
      </div>
      <CollectionForm category={category} />

      {/* Sub-categories */}
      <section className="max-w-3xl rounded-xl bg-white p-5 shadow-card md:p-6" aria-labelledby="subcategories">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="subcategories" className="font-display text-lg">
              Sub-categories
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-fog">
              The headings this collection opens onto — in the header menu, the shop&apos;s chips and
              its shop-by-category tiles. File a product under one from its own page. A sub-category
              with nothing in stock stays off the storefront until it has.
            </p>
          </div>
          <Link
            href={`/admin/collections/${category.id}/subcategories/new`}
            className="btn btn-solid btn-sm shrink-0"
          >
            New sub-category
          </Link>
        </div>

        {(subcategories ?? []).length === 0 ? (
          <p className="mt-5 rounded-lg bg-cream px-4 py-4 text-sm text-ink-soft">
            No sub-categories yet — add the first one. (Migration 0011 brings the starting set; until
            it has run, none can be saved.)
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b hairline">
                  <th className={thClass}>
                    <span className="sr-only">Image</span>
                  </th>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Sort</th>
                  <th className={thClass}>Storefront</th>
                  <th className={thClass}>Products</th>
                  <th className={thClass}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(subcategories ?? []).map((sub) => {
                  const count = counts?.get(sub.slug) ?? 0;
                  return (
                    <tr key={sub.id} className="border-b hairline last:border-0">
                      <td className="py-3 pr-2">
                        <ImageThumb url={sub.image} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{sub.name}</p>
                        <p className="text-[0.78rem] text-fog">{sub.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{sub.sort_order}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[0.82rem] font-semibold ${
                            sub.show_in_nav === false ? "text-fog" : count > 0 ? "text-sale" : "text-fog"
                          }`}
                        >
                          {sub.show_in_nav === false ? "Hidden" : count > 0 ? "Shown" : "Empty — not shown"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{counts ? count : "—"}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center justify-end gap-4 whitespace-nowrap">
                          <Link
                            href={`/admin/collections/${category.id}/subcategories/${sub.id}/edit`}
                            className="text-[0.85rem] font-medium text-clay hover:underline"
                          >
                            Edit
                          </Link>
                          <DeleteButton
                            confirmMessage={
                              count > 0
                                ? `Delete “${sub.name}”? Its ${count} product${count === 1 ? "" : "s"} stay in ${category.name}, filed under no sub-category.`
                                : `Delete “${sub.name}”? This can't be undone.`
                            }
                            action={deleteSubcategory.bind(null, sub.id)}
                          />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
