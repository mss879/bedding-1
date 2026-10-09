import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetCategory, adminGetSubcategory } from "@/lib/admin/data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SubcategoryForm } from "@/components/admin/SubcategoryForm";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "Edit sub-category",
};

export default async function AdminEditSubcategoryPage({
  params,
}: {
  params: Promise<{ id: string; subId: string }>;
}) {
  const { id, subId } = await params;

  if (getSupabaseAdmin() === null) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl md:text-4xl">Edit sub-category</h1>
        <SetupNotice />
      </div>
    );
  }

  const [category, subcategory] = await Promise.all([adminGetCategory(id), adminGetSubcategory(subId)]);
  // The address names both, so a sub-category reached through another
  // collection's URL is not shown as if it belonged there.
  if (!category || !subcategory || subcategory.category_slug !== category.slug) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/collections/${category.id}/edit`}
          className="text-sm text-ink-soft hover:text-ink hover:underline"
        >
          ← {category.name}
        </Link>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Edit sub-category</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          {subcategory.name} · in {category.name}
        </p>
      </div>
      <SubcategoryForm category={category} subcategory={subcategory} />
    </div>
  );
}
