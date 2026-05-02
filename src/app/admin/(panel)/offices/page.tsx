import { listOfficesForAdmin } from "@/lib/admin-data";
import AdminOfficesView from "./admin-offices-view";

export const dynamic = "force-dynamic";

export default async function AdminOfficesPage() {
  const offices = await listOfficesForAdmin();
  return <AdminOfficesView offices={offices} />;
}
