import { getNavCategories } from "@/lib/catalog";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { SmoothScroll } from "@/components/SmoothScroll";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getNavCategories();

  return (
    <CartProvider>
      <SmoothScroll />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
      <CartDrawer />
      <WhatsAppFloat />
    </CartProvider>
  );
}
