import { listCategoriesForAdmin } from "@/lib/admin-data";
import AdminCategoriesView from "./admin-categories-view";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesForAdmin();
  return <AdminCategoriesView categories={categories} />;
}
