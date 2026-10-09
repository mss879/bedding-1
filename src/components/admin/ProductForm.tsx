"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveProduct, uploadImage } from "@/lib/admin/actions";
import { ImageThumb, PHOTO_TYPES, photoLocation } from "@/components/admin/ImageThumb";
import type { Category, Product, ProductKind, Subcategory } from "@/lib/types";

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

export function ProductForm({
  categories,
  subcategories = [],
  product,
}: {
  categories: Category[];
  /** Every sub-category; the form offers the chosen collection's. */
  subcategories?: Subcategory[];
  product?: Product;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Which photo row is being replaced, and progress through a batch of new
  // photos. Uploads go straight to Supabase Storage.
  const [uploadingKey, setUploadingKey] = useState<number | null>(null);
  const [adding, setAdding] = useState<{ done: number; total: number } | null>(null);
  const uploading = uploadingKey !== null || adding !== null;

  const [categorySlug, setCategorySlug] = useState(product?.category_slug ?? categories[0]?.slug ?? "");
  const [subcategorySlug, setSubcategorySlug] = useState(product?.subcategory_slug ?? "");
  const [kind, setKind] = useState<ProductKind>(product?.kind ?? "physical");
  const isVoucher = kind === "voucher";
  const collectionSubs = subcategories.filter((s) => s.category_slug === categorySlug);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  // While the slug hasn't been edited by hand, it live-follows the name.
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  // Keys for the dynamic rows so removals don't reshuffle React state.
  // The initial rows take their keys by index — a ref must not be *read* during
  // render — and the counter then starts past them for rows added later.
  const initialImages = product?.images ?? [];
  const initialSizes =
    product && product.sizes.length > 0
      ? product.sizes
      : [{ name: "", dimensions: "", price: 0, compare_at_price: null }];

  const nextKey = useRef(initialImages.length + initialSizes.length);
  const makeKey = () => nextKey.current++;

  const [images, setImages] = useState<ImageRow[]>(() =>
    initialImages.map((url, i) => ({ key: i, url }))
  );
  const [sizes, setSizes] = useState<SizeRow[]>(() =>
    initialSizes.map((s, i) => ({
      key: initialImages.length + i,
      name: s.name,
      dimensions: s.dimensions,
      price: product && product.sizes.length > 0 ? String(s.price) : "",
      compareAt: s.compare_at_price == null ? "" : String(s.compare_at_price),
    }))
  );

  function setImage(key: number, url: string) {
    setImages((rows) => rows.map((row) => (row.key === key ? { ...row, url } : row)));
  }

  function moveImageUp(key: number) {
    setImages((rows) => {
      const i = rows.findIndex((row) => row.key === key);
      if (i < 1) return rows;
      const next = [...rows];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }

  function upload(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "products");
    return uploadImage(fd);
  }

  /** Swaps the photo in one row for a newly uploaded one. */
  async function handleReplace(key: number, file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploadingKey(key);
    const result = await upload(file);
    setUploadingKey(null);
    if (result.ok) setImage(key, result.url);
    else setError(result.error);
  }

  /** Uploads new photos one by one, in the order chosen, adding each as it lands. */
  async function handleAdd(files: File[]) {
    if (files.length === 0) return;
    setError(null);
    const failed: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setAdding({ done: i, total: files.length });
      const result = await upload(files[i]);
      if (result.ok) {
        const row = { key: makeKey(), url: result.url };
        setImages((rows) => [...rows, row]);
      } else {
        failed.push(`${files[i].name}: ${result.error}`);
      }
    }
    setAdding(null);
    if (failed.length > 0) {
      setError(
        failed.length === 1 ? failed[0] : `${failed.length} photos couldn't be uploaded. ${failed.join(" ")}`
      );
    }
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
        category_slug: categorySlug,
        subcategory_slug: subcategorySlug || null,
        kind,
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
                value={categorySlug}
                onChange={(e) => {
                  setCategorySlug(e.target.value);
                  // Sub-categories belong to one collection, so the choice resets.
                  setSubcategorySlug("");
                }}
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
              <label htmlFor="pf-subcategory" className={labelClass}>
                Sub-category
              </label>
              <select
                id="pf-subcategory"
                className="field"
                value={subcategorySlug}
                onChange={(e) => setSubcategorySlug(e.target.value)}
                disabled={collectionSubs.length === 0}
              >
                <option value="">— None —</option>
                {collectionSubs.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className={hintClass}>
                {subcategories.length === 0
                  ? "Sub-categories arrive with migration 0011 — run it in Supabase to file products under them."
                  : collectionSubs.length === 0
                    ? "This collection has no sub-categories yet — add them on the collection's page."
                    : "Where it sits in the menu and the shop's chips. Sub-categories are managed on the collection's page."}
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset>
              <legend className={labelClass}>Type *</legend>
              <div className="space-y-2">
                {(
                  [
                    { value: "physical", label: "Physical piece", hint: "Delivered to the shopper." },
                    {
                      value: "voucher",
                      label: "Spa voucher",
                      hint: "Digital — no delivery or cash on delivery; each one bought gets its own code.",
                    },
                  ] as const
                ).map((option) => (
                  <label key={option.value} className="flex items-start gap-2.5 text-sm text-ink">
                    <input
                      type="radio"
                      name="kind"
                      value={option.value}
                      checked={kind === option.value}
                      onChange={() => setKind(option.value)}
                      className="mt-0.5 h-4 w-4 accent-clay"
                    />
                    <span>
                      <span className="block font-medium">{option.label}</span>
                      <span className="block text-xs text-fog">{option.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="pf-badge" className={labelClass}>
                Badge
              </label>
              <input id="pf-badge" name="badge" className="field" defaultValue={product?.badge ?? ""} />
              <p className={hintClass}>
                e.g. &quot;Bestseller&quot;{isVoucher ? " or \"Voucher\"" : ""} — shown on the product image.
              </p>
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
              Material{isVoucher ? " (leave empty for a voucher)" : ""}
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
              {isVoucher ? "What's included" : "Details"}
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
              {isVoucher ? "Terms" : "Care"}
            </label>
            <textarea
              id="pf-care"
              name="care"
              rows={4}
              className="field"
              defaultValue={product?.care.join("\n") ?? ""}
            />
            <p className={hintClass}>
              One per line.{isVoucher ? " Shown under Terms on the voucher's page." : ""}
            </p>
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
            <p className={hintClass}>
              Comma-separated.{isVoucher ? " Leave empty for a voucher." : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-xl bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-lg">Images</h2>
        <div className="mt-4 space-y-3">
          {images.length === 0 && (
            <p className="text-sm text-ink-soft">No photos yet — add at least one.</p>
          )}
          {images.map((row, index) => (
            // On a phone the buttons drop to their own line under the photo.
            <div key={row.key} className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap">
              <a
                href={row.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
                aria-label={`Open photo ${index + 1} full size`}
              >
                <ImageThumb url={row.url} large />
              </a>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">
                  {index === 0 ? "Listing photo" : `Photo ${index + 1}`}
                </p>
                <p className="truncate text-xs text-fog" title={row.url}>
                  {photoLocation(row.url)}
                </p>
              </div>
              <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                <label
                  className={`btn btn-tint btn-sm shrink-0 cursor-pointer ${
                    uploading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {uploadingKey === row.key ? "Uploading…" : "Replace"}
                  <input
                    type="file"
                    accept={PHOTO_TYPES}
                    className="sr-only"
                    aria-label={`Replace photo ${index + 1}`}
                    onChange={(e) => {
                      handleReplace(row.key, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => moveImageUp(row.key)}
                    className="icon-btn shrink-0 text-lg"
                    aria-label={`Move photo ${index + 1} up`}
                  >
                    ↑
                  </button>
                ) : (
                  // Holds the arrow's place so the first row lines up with the rest.
                  images.length > 1 && <span className="hidden w-10 shrink-0 sm:block" aria-hidden />
                )}
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setImages((rows) => rows.filter((r) => r.key !== row.key))}
                    className="icon-btn shrink-0 text-lg"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <label
            className={`btn btn-tint btn-sm cursor-pointer ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {adding
              ? `Uploading ${adding.done + 1} of ${adding.total}…`
              : images.length === 0
                ? "Upload photos"
                : "Add photos"}
            <input
              type="file"
              accept={PHOTO_TYPES}
              multiple
              className="sr-only"
              onChange={(e) => {
                // Copy the list before clearing the input, which empties it.
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                handleAdd(files);
              }}
            />
          </label>
          <p className={hintClass}>
            Photos upload straight to Supabase Storage (JPEG, PNG or WebP, up to 5 MB each — you
            can pick several at once) and go live when you save. The first is the listing photo;
            use the arrow to move one up. Click a photo to see it full size.
          </p>
        </div>
      </section>

      {/* Sizes & pricing */}
      <section className="rounded-xl bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-lg">
          {isVoucher ? "Treatment options & pricing" : "Sizes & pricing"}
        </h2>
        <div className="mt-4 space-y-3">
          <div className="hidden gap-2 text-[0.72rem] font-semibold text-fog sm:grid sm:grid-cols-[1fr_1fr_1fr_1fr_2.5rem]">
            <span>Name</span>
            <span>Dimensions</span>
            <span>Price ($)</span>
            <span>{isVoucher ? "Spa value ($)" : "Compare-at ($)"}</span>
            <span />
          </div>
          {sizes.map((row, index) => (
            <div key={row.key} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_2.5rem]">
              <input
                className="field"
                aria-label={`Size ${index + 1} name`}
                placeholder={isVoucher ? "60 minutes" : "Queen"}
                value={row.name}
                onChange={(e) => setSize(row.key, { name: e.target.value })}
              />
              <input
                className="field"
                aria-label={`Size ${index + 1} dimensions`}
                placeholder={isVoucher ? "Full-body massage" : "230 × 250 cm"}
                value={row.dimensions}
                onChange={(e) => setSize(row.key, { dimensions: e.target.value })}
              />
              <input
                type="number"
                min={1}
                step={1}
                className="field"
                aria-label={`Size ${index + 1} price in US dollars`}
                placeholder="12500"
                value={row.price}
                onChange={(e) => setSize(row.key, { price: e.target.value })}
              />
              <input
                type="number"
                min={1}
                step={1}
                className="field"
                aria-label={`Size ${index + 1} compare-at price in US dollars`}
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
            {isVoucher
              ? "Prices are whole dollars. Spa value is what the treatment costs at the spa — it shows as a quiet strike-through beside your price. Keep it higher than the price."
              : "Prices are whole dollars. Compare-at shows a strikethrough \"was\" price — leave it blank unless the size is on sale, and keep it higher than the price."}
          </p>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending || uploading} className="btn btn-solid disabled:opacity-60">
          {uploading ? "Uploading photos…" : pending ? "Saving…" : "Save product"}
        </button>
        <Link href="/admin/products" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
