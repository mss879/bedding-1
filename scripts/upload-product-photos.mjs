// Puts product photographs into Supabase Storage.
//
// A SQL migration can only record where a photo lives — it cannot carry the
// file. The catalogue migrations therefore point products at site paths under
// public/images/products/. This script uploads those files to the public
// `product-images` bucket (created by migration 0003) and repoints each
// product at its bucket address, so the photographs sit in Supabase with the
// rest of the catalogue and are replaced from the admin dashboard like any
// photo uploaded there.
//
//   npm run photos:upload                 the Molee edit (migration 0008)
//   npm run photos:upload -- --all        every product still on a site path
//   npm run photos:upload -- --dry-run    list what would change, write nothing
//
// It reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
// .env.local, so it writes to whichever project that file points at.
//
// Safe to run again: an upload replaces the same object, and a product already
// pointing at the bucket is left alone. A product is only repointed once every
// one of its photographs is confirmed readable at its new address.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const SITE_PREFIX = "/images/products/";
const CONTENT_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};
/** Products handled at once. Each uploads its own few photographs in parallel. */
const CONCURRENCY = 4;

const args = process.argv.slice(2);
const unknown = args.filter((a) => !["--all", "--dry-run"].includes(a));
if (unknown.length > 0) fail(`Unknown option: ${unknown.join(" ")}. Use --all and/or --dry-run.`);
const dryRun = args.includes("--dry-run");
const prefix = args.includes("--all") ? SITE_PREFIX : `${SITE_PREFIX}molee/`;

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

function fail(message) {
  console.error(`\n${message}`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. Run this with `npm run photos:upload`, which reads them from .env.local.");
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const bucket = sb.storage.from(BUCKET);

const { data: bucketInfo, error: bucketError } = await sb.storage.getBucket(BUCKET);
if (bucketError || !bucketInfo) {
  fail(`The "${BUCKET}" bucket was not found (${bucketError?.message ?? "no such bucket"}). Run migration 0003 first.`);
}
if (!bucketInfo.public) {
  fail(`The "${BUCKET}" bucket is private, so the storefront could not show anything stored in it. Make it public (migration 0003 does).`);
}

const { data: products, error: productsError } = await sb
  .from("products")
  .select("id, slug, images")
  .order("slug");
if (productsError || !products) fail(`Could not read the products: ${productsError?.message}`);

const todo = products.filter((p) => (p.images ?? []).some((image) => image.startsWith(prefix)));
const photoCount = todo.reduce((n, p) => n + p.images.filter((image) => image.startsWith(prefix)).length, 0);

console.log(`Project:  ${new URL(url).host}`);
console.log(`Bucket:   ${BUCKET}`);
console.log(`Products: ${products.length} in the catalogue, ${todo.length} with photographs on a site path under ${prefix}`);
console.log(`Photos:   ${photoCount} to upload${dryRun ? "  (dry run — nothing will be written)" : ""}\n`);

if (todo.length === 0) {
  console.log("Nothing to do — these photographs are already in Supabase.");
  process.exit(0);
}

/** Uploads one site-path photograph and returns its public bucket address. */
async function uploadPhoto(sitePath) {
  const type = CONTENT_TYPES[path.extname(sitePath).toLowerCase()];
  if (!type) throw new Error(`${sitePath} is not an image type the storefront serves`);
  const file = path.join(publicDir, sitePath);
  // A path from the database must not be able to reach outside public/.
  if (path.relative(publicDir, file).startsWith("..")) throw new Error(`${sitePath} is outside public/`);
  const bytes = await readFile(file).catch(() => {
    throw new Error(`${sitePath} is not in public/ — is this checkout missing its photographs?`);
  });

  const objectPath = sitePath.slice(SITE_PREFIX.length);
  const { error } = await bucket.upload(objectPath, bytes, {
    contentType: type,
    // These names never change meaning: a replacement uploaded from the
    // dashboard gets a new name, so the object can be cached for good.
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`upload of ${objectPath} failed: ${error.message}`);

  const { publicUrl } = bucket.getPublicUrl(objectPath).data;
  const check = await fetch(publicUrl, { method: "HEAD" });
  if (!check.ok) throw new Error(`${objectPath} uploaded but is not readable at its public address (HTTP ${check.status})`);
  return publicUrl;
}

async function moveProduct(product) {
  const moving = product.images.filter((image) => image.startsWith(prefix));
  if (dryRun) {
    // Still prove every file is there, so a dry run catches a broken checkout.
    for (const image of moving) await readFile(path.join(publicDir, image));
    return moving.length;
  }

  const moved = new Map(await Promise.all(moving.map(async (image) => [image, await uploadPhoto(image)])));
  const images = product.images.map((image) => moved.get(image) ?? image);
  const { error } = await sb.from("products").update({ images }).eq("id", product.id);
  if (error) throw new Error(`photographs uploaded, but the product could not be updated: ${error.message}`);
  return moving.length;
}

let done = 0;
let photos = 0;
const failures = [];
const queue = [...todo];

await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let product = queue.shift(); product; product = queue.shift()) {
      try {
        const count = await moveProduct(product);
        photos += count;
        done += 1;
        console.log(`  ${dryRun ? "would move" : "moved"}  ${product.slug}  (${count} photo${count === 1 ? "" : "s"})`);
      } catch (error) {
        failures.push(product.slug);
        console.error(`  FAILED  ${product.slug}: ${error.message}`);
      }
    }
  })
);

const productsDone = `${done} product${done === 1 ? "" : "s"}`;
console.log(
  dryRun
    ? `\nDry run: ${photos} photographs across ${productsDone} are ready to upload.`
    : `\n${photos} photographs uploaded; ${productsDone} now load${done === 1 ? "s" : ""} from Supabase.`
);
if (failures.length > 0) {
  fail(`${failures.length} product(s) were left as they were: ${failures.join(", ")}. Fix the cause and run this again — finished products are skipped.`);
}
