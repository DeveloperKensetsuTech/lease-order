import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cookie-bound Supabase client for Server Components, Route Handlers and
// Server Actions. Used to read/refresh the admin user's session.
// Data fetching that needs to bypass RLS still uses `supabaseAdmin`.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Components cannot mutate cookies; swallow the error so the
          // same client can be used everywhere. Proxy + Route Handlers refresh
          // the session and persist new cookies on the response.
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // RSC render-time mutation is a no-op
          }
        },
      },
    }
  );
}
