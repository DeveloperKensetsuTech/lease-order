import { getOffices } from "@/lib/data";
import CartForm from "./cart-form";

export default async function CartPage() {
  const offices = await getOffices();
  return <CartForm offices={offices} />;
}
