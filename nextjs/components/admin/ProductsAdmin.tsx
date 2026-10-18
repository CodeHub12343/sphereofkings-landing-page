"use client";

import { useMemo, useState, useTransition } from "react";
import styled from "styled-components";
import { PRODUCTS, Product, availability } from "@/lib/products";
import ProductEditDrawer, {
  ProductDraft,
  toDraft,
  blankDraft,
  kebab,
} from "./ProductEditDrawer";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/products/actions";

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  overflow: hidden;
`;

const Head = styled.header`
  padding: 16px 20px;
  border-bottom: 1px solid #1e1a12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }
`;

const HeadRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Pending = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #e0a94a;
  letter-spacing: 0.04em;
`;

const AddBtn = styled.button`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  padding: 8px 14px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    box-shadow: 0 0 20px rgba(240, 192, 64, 0.25);
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;

  /* Hand off to the stacked card list on phones. */
  @media (max-width: 720px) {
    display: none;
  }
`;

/* ---- Mobile stacked product cards ---- */

const CardList = styled.ul`
  display: none;

  @media (max-width: 720px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    list-style: none;
    padding: 12px;
    margin: 0;
    background: #0a0a0a;
  }
`;

const PCard = styled.li`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PTop = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const PThumb = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  background: #1a1612;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const PBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PName = styled.div`
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: #f5f0e8;
  line-height: 1.3;
`;

const PSlug = styled.div`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.7rem;
  color: #5a4a38;
  word-break: break-all;
`;

const PRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #a89880;
`;

const PRowLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
`;

const PCardFoot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #1a1510;
`;

const PPills = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  min-width: 820px;

  thead th {
    text-align: left;
    padding: 10px 18px;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a89880;
    background: #1a1612;
    border-top: 1px solid #1e1a12;
    border-bottom: 1px solid #1e1a12;
  }
  tbody td {
    padding: 12px 18px;
    border-bottom: 1px solid #1e1a12;
    color: #f5f0e8;
    vertical-align: middle;
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
`;

const EmptyRow = styled.tr`
  td {
    text-align: center;
    padding: 40px 20px !important;
    color: #a89880;
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    line-height: 1.55;

    strong {
      color: #f5f0e8;
      display: block;
      font-family: "Cinzel", serif;
      margin-bottom: 4px;
    }
  }
`;

const ProdCell = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Thumb = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  background: #0a0a0a;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Name = styled.span`
  font-family: "Cinzel", serif;
  font-weight: 700;
  color: #f5f0e8;
`;

const SlugMono = styled.span`
  display: block;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  color: #5a4a38;
  margin-top: 2px;
`;

const Pill = styled.span<{ $tone: "ok" | "warn" | "muted" | "pending" }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  ${(p) => {
    if (p.$tone === "ok")
      return "background: rgba(79,176,125,0.12); color: #4fb07d;";
    if (p.$tone === "warn")
      return "background: rgba(224,169,74,0.12); color: #e0a94a;";
    if (p.$tone === "pending")
      return "background: rgba(201,162,39,0.12); color: #f0c040;";
    return "background: #1a1612; color: #a89880;";
  }}
`;

const PillDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
`;

const Bar = styled.div`
  width: 120px;
  height: 4px;
  background: #1a1612;
  border-radius: 999px;
  overflow: hidden;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
`;

const BarFill = styled.div<{ $pct: number; $tone: "gold" | "warn" | "muted" }>`
  height: 100%;
  width: ${(p) => Math.min(100, Math.max(0, p.$pct))}%;
  background: ${(p) =>
    p.$tone === "warn"
      ? "#e0a94a"
      : p.$tone === "muted"
      ? "#5a4a38"
      : "#c9a227"};
`;

const Price = styled.span<{ $muted?: boolean }>`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
  color: ${(p) => (p.$muted ? "#5a4a38" : "#f5f0e8")};
`;

const EditBtn = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const Foot = styled.footer`
  padding: 12px 20px;
  border-top: 1px solid #1e1a12;
  background: #0a0a0a;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;
`;

const Toast = styled.div<{ $on: boolean }>`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 300;
  background: #0e0c09;
  border: 1px solid #4fb07d;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #4fb07d;
  font-weight: 700;
  transform: translateY(${(p) => (p.$on ? "0" : "20px")});
  opacity: ${(p) => (p.$on ? 1 : 0)};
  pointer-events: ${(p) => (p.$on ? "auto" : "none")};
  transition: transform 0.2s ease, opacity 0.2s ease;
`;

type ToastState = { kind: "idle" } | { kind: "msg"; text: string };

function toProduct(d: ProductDraft, existing?: Product): Product {
  const amount = Number.parseFloat(d.priceAmount);
  const price = Number.isFinite(amount) && amount > 0
    ? { amount, currency: "USD" as const }
    : undefined;
  const base = existing ?? {
    unitsSold: 0,
  };
  return {
    slug: d.slug,
    name: d.name,
    description: d.description,
    image: d.image,
    alt: d.alt,
    priceApproved: d.priceApproved && !!price,
    price,
    inventoryCap: d.inventoryCap,
    unitsSold: existing?.unitsSold ?? 0,
    purchasable: d.purchasable,
  } as Product;
}

function nextFreeSlug(taken: string[]): string {
  for (let i = 1; i < 500; i++) {
    const s = `new-product-${i}`;
    if (!taken.includes(s)) return s;
  }
  return `new-product-${Date.now()}`;
}

export default function ProductsAdmin({
  initialProducts,
}: {
  initialProducts?: Product[];
} = {}) {
  const [products, setProducts] = useState<Product[]>(() =>
    initialProducts && initialProducts.length ? initialProducts : [...PRODUCTS],
  );
  const [editing, setEditing] = useState<ProductDraft | null>(null);
  const [toast, setToast] = useState<ToastState>({ kind: "idle" });
  const [, startTransition] = useTransition();


  const takenSlugs = useMemo(() => products.map((p) => p.slug), [products]);
  const pendingCount = products.filter((p) => !p.priceApproved).length;

  const openNew = () => {
    setEditing(blankDraft(nextFreeSlug(takenSlugs)));
  };
  const openEdit = (p: Product) => {
    setEditing(toDraft(p));
  };
  const close = () => setEditing(null);

  const showToast = (text: string) => {
    setToast({ kind: "msg", text });
    window.setTimeout(() => setToast({ kind: "idle" }), 2200);
  };

  const save = (d: ProductDraft, mode: "create" | "edit") => {
    if (mode === "create") {
      const slug = kebab(d.slug) || d.slug;
      const next = toProduct({ ...d, slug });
      // Optimistic insert; roll back on server-side rejection.
      setProducts((prev) => [next, ...prev]);
      showToast(`Created · ${d.name}`);
      startTransition(async () => {
        const result = await createProductAction(next);
        if (!result.ok) {
          setProducts((prev) => prev.filter((p) => p.slug !== slug));
          showToast(`Couldn't save · ${result.error}`);
        }
      });
    } else {
      const existing = products.find((p) => p.slug === d.slug);
      if (!existing) {
        close();
        return;
      }
      const nextProduct = toProduct(d, existing);
      setProducts((prev) =>
        prev.map((p) => (p.slug === d.slug ? nextProduct : p)),
      );
      showToast(`Saved · ${d.name}`);
      startTransition(async () => {
        const result = await updateProductAction(d.slug, {
          name: nextProduct.name,
          description: nextProduct.description,
          alt: nextProduct.alt,
          image: nextProduct.image,
          priceApproved: nextProduct.priceApproved,
          price: nextProduct.price,
          inventoryCap: nextProduct.inventoryCap,
          purchasable: nextProduct.purchasable,
        });
        if (!result.ok) {
          // Revert — best effort; we don't try to re-fetch the live
          // record because that would re-overwrite the user's edit on
          // top of theirs.
          setProducts((prev) =>
            prev.map((p) => (p.slug === d.slug ? existing : p)),
          );
          showToast(`Couldn't save · ${result.error}`);
        }
      });
    }
    close();
  };

  const remove = (slug: string) => {
    const target = products.find((p) => p.slug === slug);
    setProducts((prev) => prev.filter((p) => p.slug !== slug));
    showToast(`Deleted · ${target?.name ?? slug}`);
    if (target) {
      startTransition(async () => {
        const result = await deleteProductAction(slug);
        if (!result.ok) {
          // Put it back if the server refused.
          setProducts((prev) => {
            if (prev.some((p) => p.slug === slug)) return prev;
            return [target, ...prev];
          });
          showToast(`Couldn't delete · ${result.error}`);
        }
      });
    }
    close();
  };

  return (
    <>
      <Card>
        <Head>
          <h2>Products &amp; inventory</h2>
          <HeadRight>
            <Pending>
              {pendingCount} pending price approval
            </Pending>
            <AddBtn type="button" onClick={openNew}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M6 2v8M2 6h8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              Add product
            </AddBtn>
          </HeadRight>
        </Head>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Status</th>
                <th>Shoppable</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <EmptyRow>
                  <td colSpan={6}>
                    <strong>No products yet.</strong>
                    Add your first product to populate the shop.
                  </td>
                </EmptyRow>
              ) : (
                products.map((p) => {
                  const avail = availability(p);
                  const soldOut = avail.kind === "sold-out";
                  const lowStock = avail.kind === "low-stock";
                  const barTone = soldOut ? "muted" : lowStock ? "warn" : "gold";
                  const pct = (p.unitsSold / p.inventoryCap) * 100;
                  return (
                    <tr key={p.slug}>
                      <td>
                        <ProdCell>
                          <Thumb>
                            {p.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image} alt="" />
                            ) : null}
                          </Thumb>
                          <div>
                            <Name>{p.name}</Name>
                            <SlugMono>{p.slug}</SlugMono>
                          </div>
                        </ProdCell>
                      </td>
                      <td>
                        {p.priceApproved && p.price ? (
                          <Price>${p.price.amount.toFixed(2)}</Price>
                        ) : (
                          <Pill $tone="pending">
                            <PillDot aria-hidden="true" />
                            Price pending
                          </Pill>
                        )}
                      </td>
                      <td>
                        <Bar aria-hidden="true">
                          <BarFill $pct={pct} $tone={barTone} />
                        </Bar>
                        <Price $muted>
                          {p.unitsSold.toLocaleString()} /{" "}
                          {p.inventoryCap.toLocaleString()}
                        </Price>
                      </td>
                      <td>
                        {soldOut ? (
                          <Pill $tone="muted">Sold out</Pill>
                        ) : lowStock ? (
                          <Pill $tone="warn">
                            <PillDot aria-hidden="true" />
                            Low stock
                          </Pill>
                        ) : (
                          <Pill $tone="ok">
                            <PillDot aria-hidden="true" />
                            Available
                          </Pill>
                        )}
                      </td>
                      <td>
                        {p.purchasable ? (
                          <Pill $tone="ok">
                            <PillDot aria-hidden="true" />
                            On
                          </Pill>
                        ) : (
                          <Pill $tone="muted">Off</Pill>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <EditBtn type="button" onClick={() => openEdit(p)}>
                          Edit
                        </EditBtn>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableWrap>

        {/* Mobile card list — same products, phone-friendly layout. */}
        <CardList>
          {products.length === 0 ? (
            <PCard>
              <PName>No products yet.</PName>
              <PSlug>Add your first product to populate the shop.</PSlug>
            </PCard>
          ) : (
            products.map((p) => {
              const avail = availability(p);
              const soldOut = avail.kind === "sold-out";
              const lowStock = avail.kind === "low-stock";
              const barTone = soldOut ? "muted" : lowStock ? "warn" : "gold";
              const pct = (p.unitsSold / p.inventoryCap) * 100;
              return (
                <PCard key={`m-${p.slug}`}>
                  <PTop>
                    <PThumb>
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" />
                      ) : null}
                    </PThumb>
                    <PBody>
                      <PName>{p.name}</PName>
                      <PSlug>{p.slug}</PSlug>
                    </PBody>
                  </PTop>
                  <PRow>
                    <PRowLabel>Price</PRowLabel>
                    <span>
                      {p.priceApproved && p.price ? (
                        <Price>${p.price.amount.toFixed(2)}</Price>
                      ) : (
                        <Pill $tone="pending">
                          <PillDot aria-hidden="true" />
                          Price pending
                        </Pill>
                      )}
                    </span>
                  </PRow>
                  <div>
                    <PRow>
                      <PRowLabel>Inventory</PRowLabel>
                      <Price $muted>
                        {p.unitsSold.toLocaleString()} /{" "}
                        {p.inventoryCap.toLocaleString()}
                      </Price>
                    </PRow>
                    <Bar aria-hidden="true" style={{ marginTop: 6 }}>
                      <BarFill $pct={pct} $tone={barTone} />
                    </Bar>
                  </div>
                  <PCardFoot>
                    <PPills>
                      {soldOut ? (
                        <Pill $tone="muted">Sold out</Pill>
                      ) : lowStock ? (
                        <Pill $tone="warn">
                          <PillDot aria-hidden="true" />
                          Low stock
                        </Pill>
                      ) : (
                        <Pill $tone="ok">
                          <PillDot aria-hidden="true" />
                          Available
                        </Pill>
                      )}
                      {p.purchasable ? (
                        <Pill $tone="ok">
                          <PillDot aria-hidden="true" />
                          Shoppable
                        </Pill>
                      ) : (
                        <Pill $tone="muted">Hidden</Pill>
                      )}
                    </PPills>
                    <EditBtn type="button" onClick={() => openEdit(p)}>
                      Edit
                    </EditBtn>
                  </PCardFoot>
                </PCard>
              );
            })
          )}
        </CardList>
        <Foot>
          Edits are kept locally in this session — the public shop and cart
          still read from the catalog in{" "}
          <code
            style={{
              fontFamily: "SFMono-Regular, Menlo, Consolas, monospace",
              color: "#f0c040",
            }}
          >
            lib/products.ts
          </code>
          . Wire a server data source to make approvals, additions and
          deletions persistent.
        </Foot>
      </Card>

      <ProductEditDrawer
        open={editing !== null}
        initial={editing}
        existingSlugs={takenSlugs}
        onClose={close}
        onSave={save}
        onDelete={remove}
      />

      <Toast $on={toast.kind !== "idle"} role="status" aria-live="polite">
        {toast.kind === "msg" && (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2 7l3 3 7-8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {toast.text}
          </>
        )}
      </Toast>
    </>
  );
}
