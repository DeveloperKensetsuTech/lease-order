import { listAdminUsers } from "@/lib/admin-data";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import AdminUsersView from "./admin-users-view";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient();
  const [
    {
      data: { user },
    },
    users,
  ] = await Promise.all([supabase.auth.getUser(), listAdminUsers()]);

  return (
    <AdminUsersView users={users} currentEmail={user?.email ?? null} />
  );
}
