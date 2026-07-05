import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "New collection",
};

export default async function AdminNewCollectionPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl md:text-4xl">New collection</h1>
      {getSupabaseAdmin() === null ? <SetupNotice /> : <CollectionForm />}
    </div>
  );
}
