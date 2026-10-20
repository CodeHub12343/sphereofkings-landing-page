import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShopDetailShell from "@/components/shop/ShopDetailShell";
import {
  findProductBySlug,
  listProducts,
} from "@/lib/db/collections/products";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const products = await listProducts().catch(() => []);
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProductBySlug(slug);
  if (!product) return { title: "Not found — Sphere of Kings" };
  return {
    title: `${product.name} — Sphere of Kings`,
    description: product.description.slice(0, 160),
  };
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([
    findProductBySlug(slug),
    listProducts().catch(() => []),
  ]);
  if (!product) notFound();
  return <ShopDetailShell product={product} catalog={catalog} />;
}
