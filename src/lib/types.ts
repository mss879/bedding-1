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

export type PaymentMethod = "cod" | "bank_transfer" | "card";

/** Where an order sits with the money, independent of fulfilment `status`. */
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "cancelled";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type OrderInput = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: PaymentMethod;
  /** The Terms & Conditions box at checkout was ticked. The payment gateway
   *  requires it, and placeOrder refuses any order without it. */
  acceptedTerms: boolean;
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
  // Card payments (Paycorp). Optional so rows written before migration 0006
  // still type-check; absent means the order predates card checkout.
  payment_status?: PaymentStatus;
  payment_reqid?: string | null;
  payment_txn_reference?: string | null;
  payment_auth_code?: string | null;
  payment_card_type?: string | null;
  payment_card_masked?: string | null;
  payment_response_code?: string | null;
  payment_response_text?: string | null;
  /** Currency actually charged — LKR while the catalogue prices in USD. */
  payment_currency?: string | null;
  payment_amount?: number | null;
  paid_at?: string | null;
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
