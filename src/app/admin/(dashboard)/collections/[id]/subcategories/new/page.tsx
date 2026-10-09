import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetCategory } from "@/lib/admin/data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SubcategoryForm } from "@/components/admin/SubcategoryForm";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "New sub-category",
};

export default async function AdminNewSubcategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (getSupabaseAdmin() === null) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl md:text-4xl">New sub-category</h1>
        <SetupNotice />
      </div>
    );
  }

  const category = await adminGetCategory(id);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/collections/${category.id}/edit`}
          className="text-sm text-ink-soft hover:text-ink hover:underline"
        >
          ← {category.name}
        </Link>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">New sub-category</h1>
        <p className="mt-1.5 text-sm text-ink-soft">In {category.name}</p>
      </div>
      <SubcategoryForm category={category} />
    </div>
  );
}
