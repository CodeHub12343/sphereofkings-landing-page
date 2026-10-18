import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShopDetailShell from "@/components/shop/ShopDetailShell";
import {
  findProductBySlug,
  listProducts,
} from "@/lib/db/collections/products";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  // Pre-build the known catalog paths. The route is dynamic anyway so
  // new slugs that admins add after the build still render fine — this
  // just gives first-paint for the known set.
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
  const product = await findProductBySlug(slug);
  if (!product) notFound();

  return <ShopDetailShell product={product} />;
}
