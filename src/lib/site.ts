export const site = {
  name: "Aveline",
  tagline: "Fine Bedding",
  description:
    "Aveline crafts premium bed linen, duvet covers and bedding sets — woven from the finest long-staple cotton and stonewashed linen. Retail, hotel and bulk bedding from Sri Lanka.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Replace with the client's WhatsApp number (country code, no + or spaces).
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "94771852522",
  email: "hello@avelinebedding.com",
  phone: "+94 77 185 2522",
  addressLines: ["42 Galle Road", "Colombo 03, Sri Lanka"],
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
};

export const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=bedding-sets", label: "Bedding Sets" },
  { href: "/hotel-bulk", label: "Hotel & Bulk" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Checkout payment options. Bank details are placeholders — swap in the
// client's real account before launch (shown on the order-success page for
// bank-transfer orders).
export const paymentMethods = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay the courier in cash when your order arrives.",
  },
  {
    id: "bank_transfer",
    label: "Direct Bank Transfer",
    description: "Transfer to our bank account — details shown after you place the order.",
  },
] as const;

export function paymentMethodLabel(id: string) {
  return paymentMethods.find((m) => m.id === id)?.label ?? id;
}

export const bankDetails = {
  bankName: "Commercial Bank of Ceylon",
  accountName: "Aveline Bedding (Pvt) Ltd",
  accountNumber: "0000 0000 0000",
  branch: "Colombo 03",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(amount: number) {
  return `Rs ${amount.toLocaleString("en-US")}`;
}
