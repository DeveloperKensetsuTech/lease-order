import { getCategories } from "@/lib/data";
import { listMaterialsForAdmin } from "@/lib/admin-data";
import AdminMaterialsView from "./admin-materials-view";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  const [categories, allMaterials] = await Promise.all([
    getCategories(),
    listMaterialsForAdmin(),
  ]);

  return <AdminMaterialsView categories={categories} allMaterials={allMaterials} />;
}
