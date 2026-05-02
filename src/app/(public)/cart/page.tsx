import { getOffices } from "@/lib/data";
import { requireCustomer } from "@/lib/customer-auth";
import CartForm from "./cart-form";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const customer = await requireCustomer();
  const offices = await getOffices();
  return <CartForm offices={offices} customer={customer} />;
}
