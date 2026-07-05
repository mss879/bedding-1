import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminGetProduct, adminListCategories } from "@/lib/admin/data";
import { ProductForm } from "@/components/admin/ProductForm";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "Edit product",
};

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categories = await adminListCategories();

  if (categories === null) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl md:text-4xl">Edit product</h1>
        <SetupNotice />
      </div>
    );
  }

  const product = await adminGetProduct(id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Edit product</h1>
        <p className="mt-1.5 text-sm text-ink-soft">{product.name}</p>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
