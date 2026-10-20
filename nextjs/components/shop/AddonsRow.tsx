"use client";

import styled from "styled-components";
import Image from "next/image";
import Link from "next/link";
import { Product, formatMoney } from "@/lib/products";
import { useCart } from "@/lib/cart";

interface Props {
  addons: Product[];
  heading?: string;
}

/**
 * "Add these to your order" row shown under every main product.
 * Each add-on card has a one-click Add to cart (qty 1).
 */
export default function AddonsRow({ addons, heading = "Add-ons for your order" }: Props) {
  const { addItem } = useCart();
  if (addons.length === 0) return null;

  return (
    <Wrap>
      <Heading>
        {heading}
        <Sub>Every reward can be bundled with any of these.</Sub>
      </Heading>
      <Grid>
        {addons.map((a) => {
          const price = a.priceApproved && a.price
            ? formatMoney(a.price.amount, a.price.currency)
            : "$—";
          const canAdd = a.priceApproved && a.purchasable;
          return (
            <Card key={a.slug}>
              <ImgBox>
                <Link href={`/shop/${a.slug}`} aria-label={a.name}>
                  <Image src={a.image} alt={a.alt} width={320} height={180}
                         sizes="(max-width:600px) 100vw, 220px"
                         style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Link>
              </ImgBox>
              <Body>
                <Title>
                  <Link href={`/shop/${a.slug}`}>{a.name}</Link>
                </Title>
                <Row>
                  <Price>{price}</Price>
                  <AddBtn type="button" disabled={!canAdd}
                          onClick={() => canAdd && addItem(a.slug, 1)}>
                    + Add
                  </AddBtn>
                </Row>
              </Body>
            </Card>
          );
        })}
      </Grid>
    </Wrap>
  );
}

const Wrap = styled.section`margin-top:48px;`;
const Heading = styled.h2`
  font-family:"Cinzel",Georgia,serif;color:var(--gold-light,#f0c040);
  font-size:1.1rem;letter-spacing:0.14em;text-transform:uppercase;
  margin:0 0 18px;display:flex;flex-direction:column;gap:4px;
`;
const Sub = styled.span`
  font-family:"Inter",system-ui,sans-serif;color:var(--text-muted,#a89880);
  font-size:0.84rem;letter-spacing:0;text-transform:none;font-weight:400;
`;
const Grid = styled.div`
  display:grid;gap:14px;
  grid-template-columns:repeat(auto-fill,minmax(230px,1fr));
`;
const Card = styled.div`
  background:var(--bg3,#111009);border:1px solid var(--border,#2a2218);
  border-radius:10px;overflow:hidden;display:flex;flex-direction:column;
  transition:border-color .2s,box-shadow .2s;
  &:hover{border-color:#4a3c1e;box-shadow:0 4px 24px rgba(201,162,39,.06);}
`;
const ImgBox = styled.div`
  aspect-ratio:16/9;background:#0e0c09;overflow:hidden;
  a{display:block;width:100%;height:100%;}
`;
const Body = styled.div`padding:12px 14px;display:flex;flex-direction:column;gap:10px;flex:1;`;
const Title = styled.div`
  font-family:"Cinzel",Georgia,serif;color:var(--text,#f5f0e8);font-size:0.95rem;
  line-height:1.3;
  a{color:inherit;text-decoration:none;}
  a:hover{color:var(--gold-light,#f0c040);}
`;
const Row = styled.div`
  margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:8px;
`;
const Price = styled.span`
  font-family:"Cinzel",Georgia,serif;color:var(--gold-light,#f0c040);
  font-size:1rem;font-weight:700;
`;
const AddBtn = styled.button`
  font-family:"Cinzel",Georgia,serif;font-weight:700;font-size:0.78rem;
  letter-spacing:0.1em;text-transform:uppercase;
  background:linear-gradient(135deg,#b8901e 0%,#f0c040 50%,#b8901e 100%);
  background-size:200% auto;color:#0a0a0a;border:none;border-radius:5px;
  padding:7px 12px;cursor:pointer;transition:background-position .3s,box-shadow .3s;
  &:hover:not(:disabled){background-position:right center;box-shadow:0 0 20px rgba(240,192,64,.3);}
  &:disabled{opacity:.5;cursor:not-allowed;}
`;
