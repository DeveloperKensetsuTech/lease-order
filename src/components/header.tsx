import { getCurrentCustomer } from "@/lib/customer-auth";
import { countOverdueForCustomer } from "@/lib/rentals-data";
import HeaderClient from "./header-client";
import CustomerNav from "./customer-nav";

export default async function Header() {
  const customer = await getCurrentCustomer();
  const customerProp = customer
    ? { id: customer.id, company_id: customer.company_id, name: customer.name }
    : null;
  const overdueCount = customer
    ? await countOverdueForCustomer(customer.id, customer.tenant_id)
    : 0;

  return (
    <>
      <HeaderClient customer={customerProp} />
      {customerProp && <CustomerNav customer={customerProp} overdueCount={overdueCount} />}
    </>
  );
}
