import { Wrap } from "@/components/shared";
import ProductsAdmin from "@/components/admin/ProductsAdmin";
import { listProducts } from "@/lib/db/collections/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const initialProducts = await listProducts();
  return (
    <section style={pageStyle}>
      <Wrap>
        <header style={headStyle}>
          <h1 style={h1Style}>Products</h1>
          <p style={pStyle}>
            Approve prices, adjust the 1,000-unit cap and toggle shoppable per
            SKU. Changes land in the products collection immediately — the
            public <strong>/shop</strong> reads from the same source, so
            approvals and additions appear there without a redeploy.
          </p>
        </header>
        <ProductsAdmin initialProducts={initialProducts} />
      </Wrap>
    </section>
  );
}

const pageStyle = {
  padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)",
};
const headStyle = { marginBottom: 20 };
const h1Style = {
  fontFamily: "'Cinzel', serif",
  color: "#f5f0e8",
  fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
  margin: "0 0 6px",
  fontWeight: 800 as const,
};
const pStyle = {
  fontFamily: "'Inter', sans-serif",
  color: "#a89880",
  fontSize: "0.92rem",
  margin: 0,
  lineHeight: 1.55,
  maxWidth: 720,
};
