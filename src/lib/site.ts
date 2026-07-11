export const site = {
  name: "Ivory Homez",
  tagline: "Fine Bedding",
  description:
    "Ivory Homez crafts premium bed linen, duvet covers and bedding sets — woven from the finest long-staple cotton and stonewashed linen. Retail, hotel and bulk bedding.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ivoryhomez.com",
  // Replace with the client's WhatsApp number (country code, no + or spaces).
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "94771852522",
  email: "hello@ivoryhomez.com",
  phone: "+94 77 185 2522",
  addressLines: ["42 Galle Road", "Colombo 03, Sri Lanka"],
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
};

// Note: the storefront header/footer navigation is data-driven from the
// `categories` table (see getNavCategories in lib/catalog.ts), so there is no
// hardcoded nav array here — collections created in /admin appear in the nav
// automatically.

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
  accountName: "Ivory Homez",
  accountNumber: "0000 0000 0000",
  branch: "Colombo 03",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(amount: number) {
  return `Rs ${amount.toLocaleString("en-US")}`;
}
