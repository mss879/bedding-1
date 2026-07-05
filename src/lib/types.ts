export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  sort_order: number;
  // Storefront visibility, controlled from the admin dashboard. Optional so
  // rows from a database that predates migration 0002 still type-check;
  // treat anything other than `false` as visible.
  show_in_nav?: boolean;
  show_on_home?: boolean;
};

export type ProductSize = {
  name: string;
  dimensions: string;
  price: number;
  compare_at_price: number | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  short_description: string;
  description: string;
  material: string;
  details: string[];
  care: string[];
  colors: string[];
  images: string[];
  sizes: ProductSize[];
  badge: string | null;
  featured: boolean;
  in_stock: boolean;
};

export type CartItem = {
  productSlug: string;
  name: string;
  image: string;
  sizeName: string;
  unitPrice: number;
  quantity: number;
};

export type PaymentMethod = "cod" | "bank_transfer";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type OrderInput = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: PaymentMethod;
  items: { productSlug: string; sizeName: string; quantity: number }[];
};

export type Order = {
  id: string;
  reference: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_slug: string;
  product_name: string;
  size_name: string;
  unit_price: number;
  quantity: number;
};

export type InquiryInput = {
  type: "contact" | "bulk";
  name: string;
  email: string;
  phone: string;
  businessType?: string;
  quantity?: string;
  sizes?: string;
  materials?: string;
  budget?: string;
  delivery?: string;
  message: string;
};
