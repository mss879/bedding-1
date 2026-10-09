"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveSubcategory, uploadImage } from "@/lib/admin/actions";
import { ImageThumb, PHOTO_TYPES, photoLocation } from "@/components/admin/ImageThumb";
import type { Category, Subcategory } from "@/lib/types";

const labelClass = "mb-1.5 block text-[0.82rem] font-semibold text-ink";
const hintClass = "mt-1.5 text-xs leading-relaxed text-fog";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A sub-category of one collection — "Luxury Bedding" under Fine Bedlinen. It
 * stays in the collection it was created in: products can only be filed under
 * a sub-category of their own collection, and moving one would strand them.
 */
export function SubcategoryForm({
  category,
  subcategory,
}: {
  category: Category;
  subcategory?: Subcategory;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(subcategory?.name ?? "");
  const [slug, setSlug] = useState(subcategory?.slug ?? "");
  const [image, setImage] = useState(subcategory?.image ?? "");
  const [uploading, setUploading] = useState(false);
  // While the slug hasn't been edited by hand, it live-follows the name.
  const [slugTouched, setSlugTouched] = useState(Boolean(subcategory));

  const back = `/admin/collections/${category.id}/edit`;

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "subcategories");
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
      const result = await saveSubcategory({
        id: subcategory?.id,
        category_slug: category.slug,
        name,
        slug,
        description: String(form.get("description") ?? ""),
        image,
        sort_order: Number(form.get("sort_order") ?? 0),
        show_in_nav: form.get("show_in_nav") === "on",
      });
      if (result.ok) {
        router.push(back);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <section className="rounded-xl bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-lg">Basics</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sf-name" className={labelClass}>
                Name *
              </label>
              <input
                id="sf-name"
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
              <label htmlFor="sf-slug" className={labelClass}>
                Slug
              </label>
              <input
                id="sf-slug"
                className="field"
                placeholder="auto-generated from name"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(e.target.value !== "");
                }}
              />
              <p className={hintClass}>
                Used in shop URLs: /shop?category={category.slug}&amp;sub={slug || "…"}. Unique across every
                collection.
              </p>
            </div>
          </div>
          <div>
            <label htmlFor="sf-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="sf-description"
              name="description"
              rows={3}
              className="field"
              defaultValue={subcategory?.description ?? ""}
              placeholder="One line, shown at the top of the sub-category's shop page"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <div>
              <p id="sf-image" className={labelClass}>
                Image
              </p>
              <div className="flex items-center gap-3" aria-labelledby="sf-image">
                {image ? (
                  <a
                    href={image}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0"
                    aria-label="Open the sub-category photo full size"
                  >
                    <ImageThumb url={image} large />
                  </a>
                ) : (
                  <ImageThumb url="" large />
                )}
                <p className="min-w-0 flex-1 truncate text-xs text-fog" title={image}>
                  {image ? photoLocation(image) : "No photo yet — the collection's photo stands in"}
                </p>
                <label
                  className={`btn btn-tint btn-sm shrink-0 cursor-pointer ${
                    uploading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {uploading ? "Uploading…" : image ? "Replace" : "Upload"}
                  <input
                    type="file"
                    accept={PHOTO_TYPES}
                    className="sr-only"
                    aria-label={image ? "Replace the sub-category photo" : "Upload the sub-category photo"}
                    onChange={(e) => {
                      handleUpload(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <p className={hintClass}>
                A square photograph, shown in the header menu and the shop-by-category tiles. It
                uploads straight to Supabase Storage (JPEG, PNG or WebP, up to 5 MB) and goes live when
                you save.
              </p>
            </div>
            <div>
              <label htmlFor="sf-sort" className={labelClass}>
                Sort order
              </label>
              <input
                id="sf-sort"
                name="sort_order"
                type="number"
                step={1}
                className="field"
                defaultValue={subcategory?.sort_order ?? 0}
              />
              <p className={hintClass}>Lower numbers come first.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-lg">Storefront</h2>
        <div className="mt-4">
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              name="show_in_nav"
              defaultChecked={subcategory ? subcategory.show_in_nav !== false : true}
              className="mt-0.5 h-4 w-4 accent-clay"
            />
            <span>
              <span className="block text-sm font-medium text-ink">Show on the storefront</span>
              <span className="block text-xs text-fog">
                In the header menu, the shop&apos;s chips and the shop-by-category tiles — once it holds
                a product that is in stock. An empty sub-category stays out of sight on its own.
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
        <button type="submit" disabled={pending || uploading} className="btn btn-solid disabled:opacity-60">
          {uploading ? "Uploading photo…" : pending ? "Saving…" : "Save sub-category"}
        </button>
        <Link href={back} className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
