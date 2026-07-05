export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  sort_order: number;
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

export type OrderInput = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  items: { productSlug: string; sizeName: string; quantity: number }[];
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
