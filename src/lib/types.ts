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

/**
 * One level under a collection — "Luxury Bedding", "Pillows & Cushions".
 * Slugs are unique across the whole catalogue, not just within a collection,
 * so a product can point at one by slug alone (migration 0011).
 */
export type Subcategory = {
  id: string;
  slug: string;
  category_slug: string;
  name: string;
  description: string;
  image: string;
  sort_order: number;
  /** Anything other than `false` is visible, as with collections. */
  show_in_nav?: boolean;
};

/**
 * What a product is. A voucher is a spa experience sold as a code: it has no
 * delivery, no address and no cash-on-delivery, and each unit bought gets a
 * code of its own (see `Voucher`).
 */
export type ProductKind = "physical" | "voucher";

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
  // Migration 0011. Optional so rows from a database that predates it still
  // type-check: no sub-category, and a missing kind means a physical piece.
  subcategory_slug?: string | null;
  kind?: ProductKind;
};

export type CartItem = {
  productSlug: string;
  name: string;
  image: string;
  sizeName: string;
  unitPrice: number;
  quantity: number;
  /** Absent on baskets saved before vouchers existed; treat as physical. */
  kind?: ProductKind;
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

/** pending: ordered, not yet paid · issued: paid, the code is live · redeemed: used at the spa · void: cancelled. */
export type VoucherStatus = "pending" | "issued" | "redeemed" | "void";

/** One spa voucher — a single unit of a voucher line, with its own code. */
export type Voucher = {
  code: string;
  order_id: string;
  order_item_id: string | null;
  product_slug: string;
  product_name: string;
  size_name: string;
  /** What the spa honours it for (the option's compare-at price, else its price). */
  value: number;
  /** What the shopper paid for this one unit. */
  paid: number;
  status: VoucherStatus;
  issued_at: string | null;
  redeemed_at: string | null;
  redeemed_note: string;
  created_at: string;
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
