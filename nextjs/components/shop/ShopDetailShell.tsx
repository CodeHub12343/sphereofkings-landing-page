"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetail from "./ProductDetail";
import AddonsRow from "./AddonsRow";
import PuzzlePicker from "./PuzzlePicker";
import PhotoUploader from "./PhotoUploader";
import ColorPicker from "./ColorPicker";
import { Wrap } from "@/components/shared";
import { Product } from "@/lib/products";

const Section = styled.section`
  padding: clamp(32px, 5vw, 72px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
`;

interface Props { product: Product; catalog: Product[]; }

/**
 * Wraps ProductDetail with the shared Header / Footer, the puzzle
 * picker and photo uploader (when the product requires them), and
 * the owner-mandated add-on row at the bottom.
 */
export default function ShopDetailShell({ product, catalog }: Props) {
  // Resolve add-ons declared on the product. Fall back to every
  // "addon" category product (minus this one if it is itself an add-on
  // or itself the referenced slug), so new catalog items appear.
  const declared = product.addonSlugs ?? [];
  const explicit = declared.length > 0
    ? declared
        .map((slug) => catalog.find((p) => p.slug === slug))
        .filter((x): x is Product => !!x)
    : catalog
        .filter((p) => p.category === "addon" && p.slug !== product.slug);

  return (
    <>
      <Header />
      <main>
        <Section>
          <Wrap>
            <ProductDetail product={product}>
              {product.puzzleOptions && product.puzzleOptions.length > 0 && (
                <PuzzlePicker productSlug={product.slug} options={product.puzzleOptions} />
              )}
              {product.requiresPhotoUpload && (
                <PhotoUploader productSlug={product.slug} />
              )}
              {product.colorable && (
                <ColorPicker
                  productSlug={product.slug}
                  pattern={product.colorable.pattern}
                  defaultColors={product.colorable.defaultColors}
                  helper={product.colorable.helper}
                />
              )}
            </ProductDetail>
            <AddonsRow addons={explicit} />
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
