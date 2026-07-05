import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { deleteProduct } from "@/lib/admin/actions";
import { adminListCategories, adminListProducts } from "@/lib/admin/data";
import { formatPrice } from "@/lib/site";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "Products",
};

const thClass = "px-4 py-3 text-left text-[0.78rem] font-semibold text-fog";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([adminListProducts(), adminListCategories()]);

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-3xl md:text-4xl">Products</h1>
      <Link href="/admin/products/new" className="btn btn-solid btn-sm">
        New product
      </Link>
    </div>
  );

  if (products === null) {
    return (
      <div className="space-y-6">
        {header}
        <SetupNotice />
      </div>
    );
  }

  const categoryNames = new Map((categories ?? []).map((c) => [c.slug, c.name]));

  return (
    <div className="space-y-6">
      {header}

      {products.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-card">
          <p className="font-display text-2xl text-ink">No products yet</p>
          <p className="mt-2 text-sm text-ink-soft">
            Add your first product and it appears in the shop straight away.
          </p>
          <Link href="/admin/products/new" className="btn btn-solid mt-6">
            New product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b hairline">
                <th className={thClass}>
                  <span className="sr-only">Image</span>
                </th>
                <th className={thClass}>Name</th>
                <th className={thClass}>Collection</th>
                <th className={thClass}>Price</th>
                <th className={thClass}>Sizes</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const firstSize = product.sizes[0];
                return (
                  <tr key={product.id} className="border-b hairline last:border-0">
                    <td className="py-3 pl-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-sand">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{product.name}</p>
                      <p className="text-[0.78rem] text-fog">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {categoryNames.get(product.category_slug) ?? product.category_slug}
                    </td>
                    <td className="px-4 py-3">
                      {firstSize ? (
                        <span className={firstSize.compare_at_price ? "font-medium text-sale" : ""}>
                          From {formatPrice(firstSize.price)}
                        </span>
                      ) : (
                        <span className="text-fog">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{product.sizes.length}</td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[0.82rem] font-semibold ${
                            product.in_stock ? "text-sale" : "text-fog"
                          }`}
                        >
                          {product.in_stock ? "In stock" : "Out of stock"}
                        </span>
                        {product.featured && <span className="badge-img">Featured</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center justify-end gap-4 whitespace-nowrap">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-[0.85rem] font-medium text-clay hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          confirmMessage={`Delete “${product.name}”? This can't be undone.`}
                          action={deleteProduct.bind(null, product.id)}
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
    </div>
  );
}
