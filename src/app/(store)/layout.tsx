import { getNavCategories } from "@/lib/catalog";
import { getHeaderMenu } from "@/lib/header-menu";
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
  const categories = await getNavCategories();
  // Each collection's header panel: its stocked sub-categories and pages.
  const menu = await getHeaderMenu(categories);

  return (
    <CartProvider>
      <SmoothScroll />
      <ScrollProgress />
      <Header categories={categories} menu={menu} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
      <CartDrawer />
      <WhatsAppFloat />
    </CartProvider>
  );
}
