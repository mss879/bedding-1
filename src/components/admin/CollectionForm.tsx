"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveCategory, uploadImage } from "@/lib/admin/actions";
import type { Category } from "@/lib/types";

const labelClass = "mb-1.5 block text-[0.82rem] font-semibold text-ink";
const hintClass = "mt-1.5 text-xs leading-relaxed text-fog";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CollectionForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [uploading, setUploading] = useState(false);
  // While the slug hasn't been edited by hand, it live-follows the name.
  const [slugTouched, setSlugTouched] = useState(Boolean(category));

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadImage(fd);
    setUploading(false);
    if (result.ok) setImage(result.url);
    else setError(result.error);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await saveCategory({
        id: category?.id,
        name,
        slug,
        description: String(form.get("description") ?? ""),
        image,
        sort_order: Number(form.get("sort_order") ?? 0),
        show_in_nav: form.get("show_in_nav") === "on",
        show_on_home: form.get("show_on_home") === "on",
      });
      if (result.ok) {
        router.push("/admin/collections");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      {/* Basics */}
      <section className="rounded-xl bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-lg">Basics</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cf-name" className={labelClass}>
                Name *
              </label>
              <input
                id="cf-name"
                required
                className="field"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </div>
            <div>
              <label htmlFor="cf-slug" className={labelClass}>
                Slug
              </label>
              <input
                id="cf-slug"
                className="field"
                placeholder="auto-generated from name"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(e.target.value !== "");
                }}
              />
              <p className={hintClass}>Used in shop URLs: /shop?category={slug || "…"}</p>
            </div>
          </div>
          <div>
            <label htmlFor="cf-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="cf-description"
              name="description"
              rows={3}
              className="field"
              defaultValue={category?.description ?? ""}
              placeholder="Shown at the top of the collection's shop page"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <div>
              <label htmlFor="cf-image" className={labelClass}>
                Image *
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="cf-image"
                  type="url"
                  required
                  className="field"
                  placeholder="https://… or upload →"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <label
                  className={`btn btn-tint btn-sm shrink-0 cursor-pointer ${
                    uploading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {uploading ? "Uploading…" : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      handleUpload(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <p className={hintClass}>
                Shown on the homepage circles and shop tiles. Upload a photo (up to 5 MB) or paste an
                https:// Unsplash / Supabase Storage URL.
              </p>
            </div>
            <div>
              <label htmlFor="cf-sort" className={labelClass}>
                Sort order
              </label>
              <input
                id="cf-sort"
                name="sort_order"
                type="number"
                step={1}
                className="field"
                defaultValue={category?.sort_order ?? 0}
              />
              <p className={hintClass}>Lower numbers come first.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Storefront visibility */}
      <section className="rounded-xl bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-lg">Storefront</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              name="show_in_nav"
              defaultChecked={category ? category.show_in_nav !== false : true}
              className="mt-0.5 h-4 w-4 accent-clay"
            />
            <span>
              <span className="block text-sm font-medium text-ink">Show in navigation menus</span>
              <span className="block text-xs text-fog">
                Header menu, footer links and the shop filter chips.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              name="show_on_home"
              defaultChecked={category ? category.show_on_home !== false : true}
              className="mt-0.5 h-4 w-4 accent-clay"
            />
            <span>
              <span className="block text-sm font-medium text-ink">Show on the homepage</span>
              <span className="block text-xs text-fog">
                Category circles and homepage collection sections.
              </span>
            </span>
          </label>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-solid disabled:opacity-60">
          {pending ? "Saving…" : "Save collection"}
        </button>
        <Link href="/admin/collections" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
