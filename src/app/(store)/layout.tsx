import { getNavCategories, getProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollProgress } from "@/components/anim/ScrollProgress";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, products] = await Promise.all([getNavCategories(), getProducts()]);

  // Four pieces per collection for the header mega panels. Featured first so
  // the menu leads with what the maison is pushing; both queries are already
  // request-cached, so this costs nothing extra per page.
  const menuProducts: Record<string, Product[]> = {};
  for (const category of categories) {
    menuProducts[category.slug] = products
      .filter((p) => p.category_slug === category.slug)
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .slice(0, 4);
  }

  return (
    <CartProvider>
      <SmoothScroll />
      <ScrollProgress />
      <Header categories={categories} menuProducts={menuProducts} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
      <CartDrawer />
      <WhatsAppFloat />
    </CartProvider>
  );
}
