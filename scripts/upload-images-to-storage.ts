/**
 * public/images/ 配下の画像を Supabase Storage (bucket: materials) にアップロードし、
 * DB の url 参照を書き換える。
 *
 * - sanshin テナント: url を Storage の public URL に書き換え
 * - union テナント: 画像なしに（material_images / images を削除、categories.image_url を null）
 *
 * 実行:
 *   npx tsx --env-file=.env.local scripts/upload-images-to-storage.ts
 *
 * 冪等。再実行しても重複アップロード・重複更新は起きない。
 */

import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定。.env.local を確認してください。"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKET = "materials";
const SANSHIN_SLUG = "sanshin";
const UNION_SLUG = "union";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type Mapping = {
  localDir: string;
  storagePrefix: string;
  oldUrlPrefix: string;
};

const MAPPINGS: Mapping[] = [
  {
    localDir: "public/images/materials",
    storagePrefix: `${SANSHIN_SLUG}/products`,
    oldUrlPrefix: "/images/materials",
  },
  {
    localDir: "public/images/catalog-pages",
    storagePrefix: `${SANSHIN_SLUG}/catalog-pages`,
    oldUrlPrefix: "/images/catalog-pages",
  },
];

const CONCURRENCY = 8;

async function uploadFiles(): Promise<void> {
  for (const mapping of MAPPINGS) {
    const files = readdirSync(mapping.localDir);
    console.log(
      `\n[upload] ${files.length} files: ${mapping.localDir} → ${BUCKET}/${mapping.storagePrefix}/`
    );

    let ok = 0;
    let fail = 0;
    const queue = [...files];

    await Promise.all(
      Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length > 0) {
          const filename = queue.shift()!;
          const localPath = join(mapping.localDir, filename);
          const storagePath = `${mapping.storagePrefix}/${filename}`;
          const contentType =
            MIME[extname(filename).toLowerCase()] ?? "application/octet-stream";
          const buffer = readFileSync(localPath);
          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, buffer, { contentType, upsert: true });
          if (error) {
            console.error(`  ✗ ${filename}: ${error.message}`);
            fail++;
          } else {
            ok++;
          }
        }
      })
    );

    console.log(`  done: ${ok} ok, ${fail} fail`);
  }
}

function publicUrl(storagePath: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

function translateUrl(oldUrl: string): string | null {
  for (const mapping of MAPPINGS) {
    if (oldUrl.startsWith(mapping.oldUrlPrefix + "/")) {
      const filename = oldUrl.slice(mapping.oldUrlPrefix.length + 1);
      return publicUrl(`${mapping.storagePrefix}/${filename}`);
    }
  }
  return null;
}

async function getTenantId(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function updateSanshinUrls(): Promise<void> {
  const tenantId = await getTenantId(SANSHIN_SLUG);
  if (!tenantId) {
    console.log(`\n[sanshin] tenant not found, skipping`);
    return;
  }
  console.log(`\n[sanshin] rewriting DB urls for tenant ${tenantId}`);

  const { data: images, error: imgErr } = await supabase
    .from("images")
    .select("id, url")
    .eq("tenant_id", tenantId);
  if (imgErr) throw imgErr;

  let imgUpdated = 0;
  for (const img of images ?? []) {
    const newUrl = translateUrl(img.url);
    if (!newUrl || newUrl === img.url) continue;
    const { error } = await supabase
      .from("images")
      .update({ url: newUrl })
      .eq("id", img.id);
    if (error) {
      console.error(`  ✗ image ${img.id}: ${error.message}`);
    } else {
      imgUpdated++;
    }
  }
  console.log(`  images.url updated: ${imgUpdated}`);

  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .select("id, image_url")
    .eq("tenant_id", tenantId);
  if (catErr) throw catErr;

  let catUpdated = 0;
  for (const c of cats ?? []) {
    if (!c.image_url) continue;
    const newUrl = translateUrl(c.image_url);
    if (!newUrl || newUrl === c.image_url) continue;
    const { error } = await supabase
      .from("categories")
      .update({ image_url: newUrl })
      .eq("id", c.id);
    if (error) {
      console.error(`  ✗ category ${c.id}: ${error.message}`);
    } else {
      catUpdated++;
    }
  }
  console.log(`  categories.image_url updated: ${catUpdated}`);
}

async function clearUnionImages(): Promise<void> {
  const tenantId = await getTenantId(UNION_SLUG);
  if (!tenantId) {
    console.log(`\n[union] tenant not found, skipping`);
    return;
  }
  console.log(`\n[union] clearing image data for tenant ${tenantId}`);

  const { data: unionImages, error: fetchErr } = await supabase
    .from("images")
    .select("id")
    .eq("tenant_id", tenantId);
  if (fetchErr) throw fetchErr;

  const imageIds = (unionImages ?? []).map((i) => i.id);

  if (imageIds.length > 0) {
    const { error: miErr } = await supabase
      .from("material_images")
      .delete()
      .in("image_id", imageIds);
    if (miErr) throw miErr;

    const { error: delErr } = await supabase
      .from("images")
      .delete()
      .in("id", imageIds);
    if (delErr) throw delErr;
    console.log(`  deleted ${imageIds.length} images + material_images`);
  } else {
    console.log(`  no images rows to delete`);
  }

  const { error: catErr } = await supabase
    .from("categories")
    .update({ image_url: null })
    .eq("tenant_id", tenantId)
    .not("image_url", "is", null);
  if (catErr) throw catErr;
  console.log(`  categories.image_url cleared`);
}

async function main(): Promise<void> {
  console.log(`Supabase: ${SUPABASE_URL}`);
  await uploadFiles();
  await updateSanshinUrls();
  await clearUnionImages();
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
