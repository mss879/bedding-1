import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin, missingAdminEnv } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  if (await isAdmin()) redirect("/admin");

  // Without Supabase nobody can sign in, so show what is missing instead of a
  // form that cannot work.
  const missing = missingAdminEnv();

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      {missing.length > 0 ? (
        <div className="w-full max-w-2xl">
          <h1 className="mb-5 font-display text-3xl text-clay">Enivrant admin</h1>
          <SetupNotice missing={missing} />
        </div>
      ) : (
        <LoginForm from={from} />
      )}
    </main>
  );
}
