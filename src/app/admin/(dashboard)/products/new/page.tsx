import type { Metadata } from "next";
import { adminListCategories } from "@/lib/admin/data";
import { ProductForm } from "@/components/admin/ProductForm";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "New product",
};

export default async function AdminNewProductPage() {
  const categories = await adminListCategories();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl md:text-4xl">New product</h1>
      {categories === null ? <SetupNotice /> : <ProductForm categories={categories} />}
    </div>
  );
}
