import type { Metadata } from "next";
import { adminConfigured } from "@/lib/admin/session";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <LoginForm configured={adminConfigured()} from={from} />
    </main>
  );
}
