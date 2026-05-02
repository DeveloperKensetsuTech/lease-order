"use client";

import { usePathname } from "next/navigation";

export default function MainPadding({
  hasCustomer,
  children,
}: {
  hasCustomer: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCustomerView =
    hasCustomer && !pathname.startsWith("/admin") && pathname !== "/login";

  return (
    <div
      className={
        isCustomerView
          ? "flex-1 flex flex-col md:pl-56 pb-20 md:pb-0"
          : "flex-1 flex flex-col"
      }
    >
      {children}
    </div>
  );
}
