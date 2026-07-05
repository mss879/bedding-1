import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminGetCategory } from "@/lib/admin/data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "Edit collection",
};

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Edit collection</h1>
        <p className="mt-1.5 text-sm text-ink-soft">{category.name}</p>
      </div>
      <CollectionForm category={category} />
    </div>
  );
}
