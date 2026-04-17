import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "./supabase-admin";

export const getTenantId = cache(async (): Promise<string> => {
  const slug = process.env.TENANT_SLUG;
  if (!slug) throw new Error("TENANT_SLUG env var is required");

  const { data, error } = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`tenant not found: ${slug}`);
  return data.id;
});
