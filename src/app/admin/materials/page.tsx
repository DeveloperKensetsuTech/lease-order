import { getAllMaterials, getCategories } from "@/lib/data";
import AdminMaterialsView from "./admin-materials-view";

export default async function AdminMaterialsPage() {
  const [categories, allMaterials] = await Promise.all([
    getCategories(),
    getAllMaterials(),
  ]);

  return <AdminMaterialsView categories={categories} allMaterials={allMaterials} />;
}
