"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveProduct, uploadImage } from "@/lib/admin/actions";
import type { Category, Product } from "@/lib/types";

const labelClass = "mb-1.5 block text-[0.82rem] font-semibold text-ink";
const hintClass = "mt-1.5 text-xs leading-relaxed text-fog";

type SizeRow = { key: number; name: string; dimensions: string; price: string; compareAt: string };
type ImageRow = { key: number; url: string };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<number | null>(null);

  // Keys for the dynamic rows so removals don't reshuffle React state.
  const nextKey = useRef(0);
  const makeKey = () => nextKey.current++;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  // While the slug hasn't been edited by hand, it live-follows the name.
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  const [images, setImages] = useState<ImageRow[]>(() =>
    product && product.images.length > 0
      ? product.images.map((url) => ({ key: makeKey(), url }))
      : [{ key: makeKey(), url: "" }]
  );
  const [sizes, setSizes] = useState<SizeRow[]>(() =>
    product && product.sizes.length > 0
      ? product.sizes.map((s) => ({
          key: makeKey(),
          name: s.name,
          dimensions: s.dimensions,
          price: String(s.price),
          compareAt: s.compare_at_price == null ? "" : String(s.compare_at_price),
        }))
      : [{ key: makeKey(), name: "", dimensions: "", price: "", compareAt: "" }]
  );

  function setImage(key: number, url: string) {
    setImages((rows) => rows.map((row) => (row.key === key ? { ...row, url } : row)));
  }

  async function handleUpload(key: number, file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploadingKey(key);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadImage(fd);
    setUploadingKey(null);
    if (result.ok) setImage(key, result.url);
    else setError(result.error);
  }

  function setSize(key: number, patch: Partial<SizeRow>) {
    setSizes((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await saveProduct({
        id: product?.id,
        name,
        slug,
        category_slug: String(form.get("category_slug") ?? ""),
        short_description: String(form.get("short_description") ?? ""),
        description: String(form.get("description") ?? ""),
        material: String(form.get("material") ?? ""),
        details: splitLines(form.get("details")),
        care: splitLines(form.get("care")),
        colors: String(form.get("colors") ?? "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        images: images.map((row) => row.url),
        sizes: sizes.map((row) => ({
          name: row.name,
          dimensions: row.dimensions,
          price: Number(row.price),
          compare_at_price: row.compareAt.trim() === "" ? null : Number(row.compareAt),
        })),
        badge: String(form.get("badge") ?? "").trim() || null,
        featured: form.get("featured") === "on",
        in_stock: form.get("in_stock") === "on",
      });
      if (result.ok) {
        router.push("/admin/products");
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
              <label htmlFor="pf-name" className={labelClass}>
                Name *
              </label>
              <input
                id="pf-name"
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
              <label htmlFor="pf-slug" className={labelClass}>
                Slug
              </label>
              <input
                id="pf-slug"
                className="field"
                placeholder="auto-generated from name"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(e.target.value !== "");
                }}
              />
              <p className={hintClass}>Used in the product URL: /product/{slug || "…"}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-category" className={labelClass}>
                Collection *
              </label>
              <select
                id="pf-category"
                name="category_slug"
                required
                className="field"
                defaultValue={product?.category_slug ?? categories[0]?.slug ?? ""}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className={hintClass}>
                  No collections yet —{" "}
                  <Link href="/admin/collections/new" className="text-clay hover:underline">
                    create one first
                  </Link>
                  .
                </p>
              )}
            </div>
            <div>
              <label htmlFor="pf-badge" className={labelClass}>
                Badge
              </label>
              <input id="pf-badge" name="badge" className="field" defaultValue={product?.badge ?? ""} />
              <p className={hintClass}>e.g. &quot;Bestseller&quot; — shown on the product image.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured ?? false}
                className="h-4 w-4 accent-clay"
              />
              Featured on the homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="in_stock"
                defaultChecked={product?.in_stock ?? true}
                className="h-4 w-4 accent-clay"
              />
              In stock
            </label>
          </div>
        </div>
      </section>

      {/* Copy */}
      <section className="rounded-xl bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-lg">Copy</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="pf-short" className={labelClass}>
              Short description
            </label>
            <input
              id="pf-short"
              name="short_description"
              className="field"
              defaultValue={product?.short_description ?? ""}
              placeholder="One line shown on listing cards"
            />
          </div>
          <div>
            <label htmlFor="pf-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="pf-description"
              name="description"
              rows={5}
              className="field"
              defaultValue={product?.description ?? ""}
            />
          </div>
          <div>
            <label htmlFor="pf-material" className={labelClass}>
              Material
            </label>
            <input
              id="pf-material"
              name="material"
              className="field"
              defaultValue={product?.material ?? ""}
              placeholder="e.g. 100% stonewashed linen / solid teak"
            />
          </div>
        </div>
      </section>

      {/* Lists */}
      <section className="rounded-xl bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-lg">Lists</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="pf-details" className={labelClass}>
              Details
            </label>
            <textarea
              id="pf-details"
              name="details"
              rows={4}
              className="field"
              defaultValue={product?.details.join("\n") ?? ""}
            />
            <p className={hintClass}>One per line.</p>
          </div>
          <div>
            <label htmlFor="pf-care" className={labelClass}>
              Care
            </label>
            <textarea
              id="pf-care"
              name="care"
              rows={4}
              className="field"
              defaultValue={product?.care.join("\n") ?? ""}
            />
            <p className={hintClass}>One per line.</p>
          </div>
          <div>
            <label htmlFor="pf-colors" className={labelClass}>
              Colours
            </label>
            <input
              id="pf-colors"
              name="colors"
              className="field"
              defaultValue={product?.colors.join(", ") ?? ""}
              placeholder="White, Oat, Sage"
            />
            <p className={hintClass}>Comma-separated.</p>
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-xl bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-lg">Images</h2>
        <div className="mt-4 space-y-3">
          {images.map((row, index) => (
            <div key={row.key} className="flex items-center gap-2">
              <input
                type="url"
                className="field"
                aria-label={`Image URL ${index + 1}`}
                placeholder="https://… or upload →"
                value={row.url}
                onChange={(e) => setImage(row.key, e.target.value)}
              />
              <label
                className={`btn btn-tint btn-sm shrink-0 cursor-pointer ${
                  uploadingKey !== null ? "pointer-events-none opacity-60" : ""
                }`}
              >
                {uploadingKey === row.key ? "Uploading…" : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    handleUpload(row.key, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => setImages((rows) => rows.filter((r) => r.key !== row.key))}
                  className="icon-btn shrink-0 text-lg"
                  aria-label={`Remove image ${index + 1}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setImages((rows) => [...rows, { key: makeKey(), url: "" }])}
            className="btn btn-tint btn-sm"
          >
            Add image
          </button>
          <p className={hintClass}>
            Upload a photo (JPEG/PNG/WebP, up to 5 MB) or paste a public HTTPS URL from
            images.unsplash.com. The first image is the listing photo.
          </p>
        </div>
      </section>

      {/* Sizes & pricing */}
      <section className="rounded-xl bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-lg">Sizes &amp; pricing</h2>
        <div className="mt-4 space-y-3">
          <div className="hidden gap-2 text-[0.72rem] font-semibold text-fog sm:grid sm:grid-cols-[1fr_1fr_1fr_1fr_2.5rem]">
            <span>Name</span>
            <span>Dimensions</span>
            <span>Price (Rs)</span>
            <span>Compare-at (Rs)</span>
            <span />
          </div>
          {sizes.map((row, index) => (
            <div key={row.key} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_2.5rem]">
              <input
                className="field"
                aria-label={`Size ${index + 1} name`}
                placeholder="Queen"
                value={row.name}
                onChange={(e) => setSize(row.key, { name: e.target.value })}
              />
              <input
                className="field"
                aria-label={`Size ${index + 1} dimensions`}
                placeholder="230 × 250 cm"
                value={row.dimensions}
                onChange={(e) => setSize(row.key, { dimensions: e.target.value })}
              />
              <input
                type="number"
                min={1}
                step={1}
                className="field"
                aria-label={`Size ${index + 1} price in rupees`}
                placeholder="12500"
                value={row.price}
                onChange={(e) => setSize(row.key, { price: e.target.value })}
              />
              <input
                type="number"
                min={1}
                step={1}
                className="field"
                aria-label={`Size ${index + 1} compare-at price in rupees`}
                placeholder="Optional"
                value={row.compareAt}
                onChange={(e) => setSize(row.key, { compareAt: e.target.value })}
              />
              <div className="flex items-center">
                {sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSizes((rows) => rows.filter((r) => r.key !== row.key))}
                    className="icon-btn shrink-0 text-lg"
                    aria-label={`Remove size ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setSizes((rows) => [
                ...rows,
                { key: makeKey(), name: "", dimensions: "", price: "", compareAt: "" },
              ])
            }
            className="btn btn-tint btn-sm"
          >
            Add size
          </button>
          <p className={hintClass}>
            Prices are whole rupees. Compare-at shows a strikethrough &quot;was&quot; price — leave it
            blank unless the size is on sale, and keep it higher than the price.
          </p>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-solid disabled:opacity-60">
          {pending ? "Saving…" : "Save product"}
        </button>
        <Link href="/admin/products" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
