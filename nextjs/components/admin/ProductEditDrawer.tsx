"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Product } from "@/lib/products";

export type ProductDraft = {
  slug: string;
  name: string;
  description: string;
  alt: string;
  image: string; // URL or data URL
  priceApproved: boolean;
  priceAmount: string; // kept as string for input ergonomics
  inventoryCap: number;
  purchasable: boolean;
};

export function toDraft(p: Product): ProductDraft {
  return {
    slug: p.slug,
    name: p.name,
    description: p.description,
    alt: p.alt,
    image: p.image,
    priceApproved: p.priceApproved,
    priceAmount: p.price ? String(p.price.amount) : "",
    inventoryCap: p.inventoryCap,
    purchasable: p.purchasable,
  };
}

export function blankDraft(suggestedSlug: string): ProductDraft {
  return {
    slug: suggestedSlug,
    name: "",
    description: "",
    alt: "",
    image: "",
    priceApproved: false,
    priceAmount: "",
    inventoryCap: 1000,
    purchasable: false,
  };
}

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function kebab(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

const Scrim = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
  transition: opacity 0.25s ease;
`;

const Panel = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(520px, 100vw);
  background: #0a0a0a;
  border-left: 1px solid #1a1510;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.6);
  z-index: 201;
  transform: translateX(${(p) => (p.$open ? "0" : "100%")});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Head = styled.header`
  padding: 20px 22px;
  border-bottom: 1px solid #1a1510;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;

  h3 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 2px;
  }
  p {
    margin: 0;
    font-size: 0.78rem;
    color: #a89880;
    font-family: "Inter", sans-serif;
  }
`;

const Close = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #a89880;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const Body = styled.div`
  padding: 20px 22px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label<{ $req?: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #a89880;
  display: flex;
  align-items: center;
  gap: 6px;

  ${(p) => p.$req && `&::after { content: " *"; color: #b91c1c; }`}
`;

const Field = styled.div<{ $err?: boolean }>`
  background: #1a1612;
  border: 1.5px solid ${(p) => (p.$err ? "#b91c1c" : "#2e2618")};
  border-radius: 8px;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  &:focus-within {
    border-color: ${(p) => (p.$err ? "#b91c1c" : "#c9a227")};
    box-shadow: 0 0 0 3px
      ${(p) =>
        p.$err ? "rgba(185, 28, 28, 0.14)" : "rgba(201, 162, 39, 0.12)"};
  }

  input,
  textarea {
    background: transparent;
    border: 0;
    outline: 0;
    color: #f5f0e8;
    font-family: "Inter", sans-serif;
    font-size: 0.95rem;
    flex: 1;
    width: 100%;
    font-weight: 500;
  }
  textarea {
    resize: vertical;
    min-height: 64px;
    line-height: 1.5;
  }
  input::placeholder,
  textarea::placeholder {
    color: #5a4a38;
  }
  .sym {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-weight: 700;
    color: #a89880;
  }
  .cur {
    font-family: "Inter", sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #a89880;
    padding-left: 10px;
    border-left: 1px solid #2e2618;
  }
`;

const Err = styled.p`
  margin: 0;
  color: #ff6b7a;
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
`;

const Hint = styled.p`
  margin: 0;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  line-height: 1.5;
`;

const ImageRow = styled.div`
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 12px;
  align-items: center;

  @media (max-width: 480px) {
    grid-template-columns: 72px 1fr;
  }
`;

const Preview = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 10px;
  overflow: hidden;
  background: #1a1612;
  border: 1px solid #2e2618;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 480px) {
    width: 72px;
    height: 72px;
  }
`;

const PreviewEmpty = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #5a4a38;
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
`;

const ImageActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UploadBtn = styled.button`
  background: transparent;
  border: 1px dashed #2e2618;
  color: #f0c040;
  padding: 10px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  text-align: center;

  &:hover {
    border-color: #c9a227;
    background: rgba(201, 162, 39, 0.06);
  }
`;

const Toggle = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #1a1612;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
`;

const ToggleBody = styled.div`
  min-width: 0;

  div:first-child {
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: #f5f0e8;
  }
  div:last-child {
    font-family: "Inter", sans-serif;
    font-size: 0.72rem;
    color: #a89880;
    margin-top: 2px;
    line-height: 1.4;
  }
`;

const Switch = styled.span<{ $on: boolean }>`
  position: relative;
  width: 38px;
  height: 22px;
  background: ${(p) => (p.$on ? "#c9a227" : "#2e2618")};
  border-radius: 999px;
  flex-shrink: 0;
  transition: background 0.15s;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${(p) => (p.$on ? "18px" : "2px")};
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${(p) => (p.$on ? "#0a0a0a" : "#f5f0e8")};
    transition: left 0.15s, background 0.15s;
  }
`;

const Note = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  color: #a89880;
  line-height: 1.5;
  margin: 0;
  padding: 10px 12px;
  background: #1a1612;
  border-left: 3px solid #e0a94a;
  border-radius: 4px;
`;

const DangerZone = styled.section`
  margin-top: 4px;
  padding: 14px;
  border: 1px solid rgba(185, 28, 28, 0.3);
  border-radius: 10px;
  background: rgba(185, 28, 28, 0.04);
`;

const DangerTitle = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ff6b7a;
  margin-bottom: 4px;
`;

const DangerCopy = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #a89880;
  line-height: 1.5;
  margin: 0 0 10px;
`;

const BtnDanger = styled.button`
  background: transparent;
  border: 1px solid #c62b44;
  color: #ff6b7a;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: rgba(198, 43, 68, 0.08);
  }
`;

const ConfirmInline = styled.div`
  background: rgba(185, 28, 28, 0.08);
  border: 1px solid #c62b44;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  span {
    font-family: "Inter", sans-serif;
    font-size: 0.82rem;
    color: #f5f0e8;
    flex: 1;
    min-width: 180px;
  }
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 8px;
`;

const BtnDangerFill = styled.button`
  background: linear-gradient(135deg, #8a1420 0%, #c62b44 50%, #8a1420 100%);
  color: #fff;
  border: 0;
  padding: 8px 14px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-weight: 800;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 18px rgba(198, 43, 68, 0.3);
  }
`;

const Actions = styled.footer`
  padding: 16px 22px;
  border-top: 1px solid #1a1510;
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const BtnGhost = styled.button`
  background: transparent;
  border: 0;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 10px 14px;
  cursor: pointer;

  &:hover {
    color: #f0c040;
  }
`;

const BtnPrimary = styled.button`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  border-radius: 8px;
  padding: 11px 20px;
  font-family: "Inter", sans-serif;
  font-weight: 800;
  font-size: 0.88rem;
  cursor: pointer;

  &:hover:not(:disabled) {
    box-shadow: 0 0 24px rgba(240, 192, 64, 0.3);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export default function ProductEditDrawer({
  open,
  initial,
  existingSlugs,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  // null = create new; non-null = edit existing
  initial: ProductDraft | null;
  // every slug currently in the admin's list (for uniqueness checks)
  existingSlugs: string[];
  onClose: () => void;
  onSave: (draft: ProductDraft, mode: "create" | "edit") => void;
  onDelete: (slug: string) => void;
}) {
  const isCreate = initial?.slug !== undefined ? false : true;
  // When editing, prefill from initial. When creating, start blank with
  // the suggested slug the parent handed us.
  const [draft, setDraft] = useState<ProductDraft | null>(initial);
  const [attempted, setAttempted] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(initial);
    setAttempted(false);
    setUploadErr(null);
    setConfirmDelete(false);
  }, [initial, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!draft) {
    return (
      <>
        <Scrim $open={false} aria-hidden="true" />
        <Panel $open={false} aria-hidden="true" />
      </>
    );
  }

  const slugTaken =
    draft.slug.trim() !== "" &&
    existingSlugs
      .filter((s) => (isCreate ? true : s !== initial?.slug))
      .includes(draft.slug);
  const slugValid = KEBAB.test(draft.slug) && !slugTaken;
  const nameValid = draft.name.trim() !== "";
  const descValid = draft.description.trim() !== "";
  const altValid = draft.alt.trim() !== "";
  const imageValid = draft.image.trim() !== "";
  const capValid = draft.inventoryCap >= 1 && draft.inventoryCap <= 10000;
  const priceNum = Number.parseFloat(draft.priceAmount);
  const priceOk = !draft.priceApproved || (Number.isFinite(priceNum) && priceNum > 0);

  const canSave =
    nameValid && slugValid && descValid && altValid && imageValid && capValid && priceOk;

  const update = (patch: Partial<ProductDraft>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadErr(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|avif|svg\+xml)$/.test(file.type)) {
      setUploadErr("Choose a PNG, JPG, WebP, AVIF or SVG image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadErr("Image is larger than 2 MB. Compress and try again.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update({ image: typeof reader.result === "string" ? reader.result : "" });
    };
    reader.onerror = () => setUploadErr("Could not read the file.");
    reader.readAsDataURL(file);
  };

  const submit = () => {
    setAttempted(true);
    if (!canSave) return;
    onSave(draft, isCreate ? "create" : "edit");
  };

  const doDelete = () => {
    if (!initial) return;
    onDelete(initial.slug);
  };

  const showHint = (ok: boolean) => attempted && !ok;

  return (
    <>
      <Scrim $open={open} onClick={onClose} aria-hidden={!open} />
      <Panel
        $open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prod-edit-title"
        aria-hidden={!open}
      >
        <Head>
          <div>
            <h3 id="prod-edit-title">
              {isCreate ? "New product" : `Edit · ${initial?.name}`}
            </h3>
            <p>
              {isCreate
                ? "Create a new SKU. Approving its price enables Add to cart on the public shop."
                : "Change pricing, inventory, imagery or purchasability."}
            </p>
          </div>
          <Close type="button" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 3l8 8M11 3l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </Close>
        </Head>
        <Body>
          <Row>
            <Label $req htmlFor="pe-name">
              Product name
            </Label>
            <Field $err={showHint(nameValid)}>
              <input
                id="pe-name"
                type="text"
                value={draft.name}
                placeholder="e.g. Complete 7-in-1"
                onChange={(e) => {
                  const name = e.target.value;
                  // Only auto-sync the slug on create, and only until the
                  // user has touched the slug field themselves.
                  const nextSlug =
                    isCreate &&
                    (draft.slug === "" || draft.slug === kebab(draft.name))
                      ? kebab(name)
                      : draft.slug;
                  update({ name, slug: nextSlug });
                }}
              />
            </Field>
            {showHint(nameValid) && <Err>Name is required.</Err>}
          </Row>

          <Row>
            <Label $req htmlFor="pe-slug">
              URL slug
            </Label>
            <Field $err={showHint(slugValid)}>
              <span className="sym">/shop/</span>
              <input
                id="pe-slug"
                type="text"
                value={draft.slug}
                placeholder="product-slug"
                onChange={(e) => update({ slug: e.target.value })}
              />
            </Field>
            {showHint(slugValid) &&
              (slugTaken ? (
                <Err>This slug is already in use.</Err>
              ) : (
                <Err>Lowercase letters, numbers and hyphens only.</Err>
              ))}
            <Hint>Appears in the product URL. Changing it breaks any existing links.</Hint>
          </Row>

          <Row>
            <Label $req htmlFor="pe-desc">
              Short description
            </Label>
            <Field $err={showHint(descValid)}>
              <textarea
                id="pe-desc"
                rows={2}
                value={draft.description}
                placeholder="One sentence a shopper reads on the product card."
                onChange={(e) => update({ description: e.target.value })}
              />
            </Field>
            {showHint(descValid) && <Err>Description is required.</Err>}
          </Row>

          <Row>
            <Label $req>Image</Label>
            <ImageRow>
              <Preview>
                {draft.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.image} alt="" />
                ) : (
                  <PreviewEmpty>No image</PreviewEmpty>
                )}
              </Preview>
              <ImageActions>
                <UploadBtn type="button" onClick={() => fileRef.current?.click()}>
                  {draft.image ? "Replace image" : "Upload image"}
                </UploadBtn>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                  hidden
                  onChange={onFile}
                />
                <Field>
                  <input
                    type="url"
                    placeholder="Or paste a hosted image URL"
                    value={draft.image.startsWith("data:") ? "" : draft.image}
                    onChange={(e) => update({ image: e.target.value })}
                  />
                </Field>
              </ImageActions>
            </ImageRow>
            {uploadErr && <Err>{uploadErr}</Err>}
            {showHint(imageValid) && <Err>Choose or paste an image.</Err>}
            <Hint>
              Uploads are kept in this session only (as data URLs). For an
              image that persists across reloads, host it and paste the URL.
            </Hint>
          </Row>

          <Row>
            <Label $req htmlFor="pe-alt">
              Alt text
            </Label>
            <Field $err={showHint(altValid)}>
              <input
                id="pe-alt"
                type="text"
                value={draft.alt}
                placeholder="What a screen reader should say about this image."
                onChange={(e) => update({ alt: e.target.value })}
              />
            </Field>
            {showHint(altValid) && <Err>Alt text is required.</Err>}
          </Row>

          <Row2>
            <Row>
              <Label $req={draft.priceApproved} htmlFor="pe-price">
                Price (USD)
              </Label>
              <Field $err={attempted && !priceOk}>
                <span className="sym">$</span>
                <input
                  id="pe-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 149.00"
                  value={draft.priceAmount}
                  onChange={(e) => update({ priceAmount: e.target.value })}
                />
                <span className="cur">USD</span>
              </Field>
              {attempted && !priceOk && (
                <Err>Enter a positive price before marking as approved.</Err>
              )}
            </Row>
            <Row>
              <Label htmlFor="pe-cap">Inventory cap</Label>
              <Field $err={showHint(capValid)}>
                <input
                  id="pe-cap"
                  type="number"
                  min={1}
                  max={10000}
                  value={draft.inventoryCap}
                  onChange={(e) =>
                    update({
                      inventoryCap: Math.max(
                        1,
                        Math.min(10000, Number(e.target.value) || 1),
                      ),
                    })
                  }
                />
              </Field>
              {showHint(capValid) && <Err>Between 1 and 10,000.</Err>}
            </Row>
          </Row2>

          <Toggle htmlFor="pe-approve">
            <ToggleBody>
              <div>Mark price as approved</div>
              <div>
                Required to enable Add to cart on the public shop. The
                Pay step at checkout stays blocked until this is on for
                every item in a customer's cart.
              </div>
            </ToggleBody>
            <input
              id="pe-approve"
              type="checkbox"
              checked={draft.priceApproved}
              onChange={(e) => update({ priceApproved: e.target.checked })}
            />
            <Switch $on={draft.priceApproved} aria-hidden="true" />
          </Toggle>

          <Toggle htmlFor="pe-shop">
            <ToggleBody>
              <div>Shoppable</div>
              <div>
                When off, the public shop hides this product entirely —
                not the same as "sold out".
              </div>
            </ToggleBody>
            <input
              id="pe-shop"
              type="checkbox"
              checked={draft.purchasable}
              onChange={(e) => update({ purchasable: e.target.checked })}
            />
            <Switch $on={draft.purchasable} aria-hidden="true" />
          </Toggle>

          <Note>
            Changes are kept locally in this session and recorded to the
            audit log once the backend is wired. The public shop still
            reads from the file catalog.
          </Note>

          {!isCreate && (
            <DangerZone>
              <DangerTitle>Danger zone</DangerTitle>
              <DangerCopy>
                Delete this product from the admin list. Existing orders and
                sales records aren't touched — only the catalog entry.
              </DangerCopy>
              {confirmDelete ? (
                <ConfirmInline>
                  <span>
                    Really delete <strong>{initial?.name}</strong>?
                  </span>
                  <ConfirmActions>
                    <BtnGhost
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      style={{ padding: "6px 10px" }}
                    >
                      Cancel
                    </BtnGhost>
                    <BtnDangerFill type="button" onClick={doDelete}>
                      Confirm delete
                    </BtnDangerFill>
                  </ConfirmActions>
                </ConfirmInline>
              ) : (
                <BtnDanger type="button" onClick={() => setConfirmDelete(true)}>
                  Delete product
                </BtnDanger>
              )}
            </DangerZone>
          )}
        </Body>
        <Actions>
          <BtnGhost type="button" onClick={onClose}>
            Cancel
          </BtnGhost>
          <BtnPrimary type="button" onClick={submit} disabled={!canSave}>
            {isCreate ? "Create product" : "Save changes"}
          </BtnPrimary>
        </Actions>
      </Panel>
    </>
  );
}
