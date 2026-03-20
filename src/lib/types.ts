export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
};

export type Material = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  spec: Record<string, string> | null;
  sort_order: number;
  is_active: boolean;
  catalog_pages?: string[];
};

export type Order = {
  id: string;
  order_number: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  email: string | null;
  note: string | null;
  status: "pending" | "confirmed" | "shipped" | "completed" | "cancelled";
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  material_id: string;
  material_name: string;
  quantity: number;
};

export type CartItem = {
  material: Material;
  quantity: number;
};
