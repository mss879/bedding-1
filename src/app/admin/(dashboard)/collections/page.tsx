import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { deleteCategory } from "@/lib/admin/actions";
import { adminCountProductsInCategory, adminListCategories } from "@/lib/admin/data";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "Collections",
};

const thClass = "px-4 py-3 text-left text-[0.78rem] font-semibold text-fog";

function Visibility({ shown }: { shown: boolean }) {
  return (
    <span className={`text-[0.82rem] font-semibold ${shown ? "text-sale" : "text-fog"}`}>
      {shown ? "Shown" : "Hidden"}
    </span>
  );
}

export default async function AdminCollectionsPage() {
  const categories = await adminListCategories();

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-3xl md:text-4xl">Collections</h1>
      <Link href="/admin/collections/new" className="btn btn-solid btn-sm">
        New collection
      </Link>
    </div>
  );

  if (categories === null) {
    return (
      <div className="space-y-6">
        {header}
        <SetupNotice />
      </div>
    );
  }

  const counts = await Promise.all(
    categories.map((c) => adminCountProductsInCategory(c.slug))
  );

  return (
    <div className="space-y-6">
      {header}

      {categories.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-card">
          <p className="font-display text-2xl text-ink">No collections yet</p>
          <p className="mt-2 text-sm text-ink-soft">
            Collections group products in the shop, the navigation and the homepage.
          </p>
          <Link href="/admin/collections/new" className="btn btn-solid mt-6">
            New collection
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b hairline">
                <th className={thClass}>
                  <span className="sr-only">Image</span>
                </th>
                <th className={thClass}>Name</th>
                <th className={thClass}>Sort</th>
                <th className={thClass}>Navigation</th>
                <th className={thClass}>Homepage</th>
                <th className={thClass}>Products</th>
                <th className={thClass}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id} className="border-b hairline last:border-0">
                  <td className="py-3 pl-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-sand">
                      {category.image && (
                        <Image src={category.image} alt="" fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{category.name}</p>
                    <p className="text-[0.78rem] text-fog">{category.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{category.sort_order}</td>
                  <td className="px-4 py-3">
                    <Visibility shown={category.show_in_nav !== false} />
                  </td>
                  <td className="px-4 py-3">
                    <Visibility shown={category.show_on_home !== false} />
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{counts[index]}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center justify-end gap-4 whitespace-nowrap">
                      <Link
                        href={`/admin/collections/${category.id}/edit`}
                        className="text-[0.85rem] font-medium text-clay hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        confirmMessage={`Delete the “${category.name}” collection? This can't be undone.`}
                        action={deleteCategory.bind(null, category.id)}
                      />
                    </span>
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
