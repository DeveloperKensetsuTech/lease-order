import { createSupabaseServerClient } from "@/lib/supabase-server";
import { countPendingOrders } from "@/lib/admin-data";
import AdminShell from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const [
    {
      data: { user },
    },
    pendingCount,
  ] = await Promise.all([supabase.auth.getUser(), countPendingOrders()]);

  return (
    <AdminShell pendingCount={pendingCount} email={user?.email ?? null}>
      {children}
    </AdminShell>
  );
}
