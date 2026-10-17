import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShopDetailShell from "@/components/shop/ShopDetailShell";
import { PRODUCTS, findProduct } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return { title: "Not found — Sphere of Kings" };
  return {
    title: `${product.name} — Sphere of Kings Christmas Early Bird`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  return <ShopDetailShell product={product} />;
}
