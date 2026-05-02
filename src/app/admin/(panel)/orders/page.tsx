import { listOrders } from "@/lib/admin-data";
import OrdersBoardOrList from "./orders-board-or-list";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  return <OrdersBoardOrList orders={orders} />;
}
