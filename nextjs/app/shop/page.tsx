import ShopLayout from "@/components/shop/ShopLayout";
import { listProducts } from "@/lib/db/collections/products";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await listProducts();
  return <ShopLayout products={products} />;
}
