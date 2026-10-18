"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "./FinanceDashboard";

export type ExpenseFormValues = {
  dateISO: string;
  vendor: string;
  description: string;
  category: ExpenseCategory;
  amount: string;
  currency: "USD" | "EUR" | "GBP";
  receiptName?: string;
};

const DEFAULTS: ExpenseFormValues = {
  dateISO: new Date().toISOString().slice(0, 10),
  vendor: "",
  description: "",
  category: "Shipping",
  amount: "",
  currency: "USD",
};

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
  width: min(480px, 100vw);
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
    font-family: "Inter", sans-serif;
    font-size: 0.78rem;
    color: #a89880;
    margin: 0;
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
  gap: 14px;
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

  ${(p) => p.$req && `&::after { content: " *"; color: #b91c1c; }`}
`;

const Field = styled.div<{ $err?: boolean }>`
  background: #1a1612;
  border: 1.5px solid ${(p) => (p.$err ? "#b91c1c" : "#2e2618")};
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: ${(p) => (p.$err ? "#b91c1c" : "#c9a227")};
    box-shadow: 0 0 0 3px
      ${(p) =>
        p.$err ? "rgba(185, 28, 28, 0.14)" : "rgba(201, 162, 39, 0.12)"};
  }

  input,
  select,
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
    min-height: 56px;
    line-height: 1.5;
  }
  input::placeholder,
  textarea::placeholder {
    color: #5a4a38;
  }
  select {
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
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

const Drop = styled.div<{ $hasFile: boolean }>`
  background: ${(p) =>
    p.$hasFile ? "rgba(79,176,125,0.08)" : "#1a1612"};
  border: 1.5px ${(p) => (p.$hasFile ? "solid" : "dashed")}
    ${(p) => (p.$hasFile ? "#4fb07d" : "#2e2618")};
  border-radius: 8px;
  padding: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: ${(p) => (p.$hasFile ? "#4fb07d" : "#c9a227")};
  }
`;

const DropIco = styled.div<{ $hasFile: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: ${(p) =>
    p.$hasFile ? "rgba(79,176,125,0.2)" : "rgba(201,162,39,0.1)"};
  color: ${(p) => (p.$hasFile ? "#4fb07d" : "#c9a227")};
  flex-shrink: 0;
`;

const DropBody = styled.div`
  flex: 1;
  min-width: 0;

  div:first-child {
    font-family: "Inter", sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    color: #f5f0e8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  div:last-child {
    font-family: "Inter", sans-serif;
    font-size: 0.72rem;
    color: #a89880;
    margin-top: 2px;
  }
`;

const DropX = styled.button`
  background: transparent;
  border: 0;
  color: #a89880;
  cursor: pointer;
  padding: 4px;
  margin-left: auto;

  &:hover {
    color: #ff6b7a;
  }
`;

const Note = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  line-height: 1.5;
  margin: 0;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  color: #5a4a38;
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

const RightActions = styled.div`
  display: flex;
  gap: 8px;
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

export default function ExpenseEntryDrawer({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: ExpenseFormValues) => void;
}) {
  const [values, setValues] = useState<ExpenseFormValues>(DEFAULTS);
  const [attempted, setAttempted] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  // Reset the form when the drawer closes so re-opens start clean.
  useEffect(() => {
    if (!open) {
      setValues(DEFAULTS);
      setAttempted(false);
    }
  }, [open]);

  // Close on Esc, lock body scroll while open.
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

  const amountNum = Number.parseFloat(values.amount);
  const amountValid = Number.isFinite(amountNum) && amountNum > 0;
  const amountErr = attempted && values.amount !== "" && !amountValid;
  const vendorErr = attempted && values.vendor.trim() === "";
  const canSave = amountValid && values.vendor.trim() !== "";

  const submit = () => {
    setAttempted(true);
    if (!canSave) return;
    onSave(values);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValues((v) => ({ ...v, receiptName: file?.name }));
  };
  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValues((v) => ({ ...v, receiptName: undefined }));
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <>
      <Scrim $open={open} onClick={onClose} aria-hidden={!open} />
      <Panel
        $open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exp-title"
        aria-hidden={!open}
      >
        <Head>
          <div>
            <h3 id="exp-title">Add expense</h3>
            <p>Entered by Elena · Finance</p>
          </div>
          <Close type="button" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Close>
        </Head>
        <Body>
          <Row2>
            <Row>
              <Label htmlFor="exp-date" $req>
                Date
              </Label>
              <Field>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  style={{ color: "#a89880", flexShrink: 0 }}
                >
                  <rect x="2" y="3" width="10" height="9" rx="1" stroke="currentColor" />
                  <path
                    d="M4 3V1.5M10 3V1.5M2 6h10"
                    stroke="currentColor"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  id="exp-date"
                  type="date"
                  value={values.dateISO}
                  onChange={(e) => setValues({ ...values, dateISO: e.target.value })}
                />
              </Field>
            </Row>
            <Row>
              <Label htmlFor="exp-cat" $req>
                Category
              </Label>
              <Field>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  style={{ color: "#a89880", flexShrink: 0 }}
                >
                  <path
                    d="M2 4l5-2 5 2v2l-5 2-5-2V4Zm0 4l5 2 5-2m-10 2 5 2 5-2"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <select
                  id="exp-cat"
                  value={values.category}
                  onChange={(e) =>
                    setValues({ ...values, category: e.target.value as ExpenseCategory })
                  }
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </Row>
          </Row2>

          <Row>
            <Label htmlFor="exp-vendor" $req>
              Vendor
            </Label>
            <Field $err={vendorErr}>
              <input
                id="exp-vendor"
                type="text"
                placeholder="e.g. DHL Express"
                value={values.vendor}
                onChange={(e) => setValues({ ...values, vendor: e.target.value })}
              />
            </Field>
            {vendorErr && <Err>Vendor is required.</Err>}
          </Row>

          <Row>
            <Label htmlFor="exp-desc">Description</Label>
            <Field>
              <input
                id="exp-desc"
                type="text"
                placeholder="One short line — what was this for?"
                value={values.description}
                onChange={(e) => setValues({ ...values, description: e.target.value })}
              />
            </Field>
          </Row>

          <Row2>
            <Row>
              <Label htmlFor="exp-amt" $req>
                Amount
              </Label>
              <Field $err={amountErr}>
                <span className="sym">$</span>
                <input
                  id="exp-amt"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={values.amount}
                  onChange={(e) => setValues({ ...values, amount: e.target.value })}
                  style={{ fontFamily: "SFMono-Regular, Menlo, Consolas, monospace", fontWeight: 700 }}
                />
                <span className="cur">{values.currency}</span>
              </Field>
              {amountErr && <Err>Enter a positive amount.</Err>}
            </Row>
            <Row>
              <Label htmlFor="exp-cur">Currency</Label>
              <Field>
                <select
                  id="exp-cur"
                  value={values.currency}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      currency: e.target.value as ExpenseFormValues["currency"],
                    })
                  }
                >
                  <option value="USD">USD · United States dollar</option>
                  <option value="EUR">EUR · Euro</option>
                  <option value="GBP">GBP · Pound sterling</option>
                </select>
              </Field>
            </Row>
          </Row2>

          <Row>
            <Label htmlFor="exp-receipt">Receipt</Label>
            <Drop
              $hasFile={!!values.receiptName}
              onClick={() => fileInput.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInput.current?.click();
                }
              }}
            >
              <DropIco $hasFile={!!values.receiptName} aria-hidden="true">
                {values.receiptName ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M4 9l3 3 7-8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect
                      x="3"
                      y="2"
                      width="12"
                      height="14"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M6 7h6M6 10h6M6 13h4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </DropIco>
              <DropBody>
                <div>{values.receiptName ?? "Attach a receipt"}</div>
                <div>
                  {values.receiptName
                    ? "Replace or remove with the ✕"
                    : "PDF, JPG or PNG · 10 MB max"}
                </div>
              </DropBody>
              {values.receiptName && (
                <DropX type="button" onClick={clearFile} aria-label="Remove receipt">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </DropX>
              )}
              <input
                ref={fileInput}
                id="exp-receipt"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                hidden
                onChange={onFile}
              />
            </Drop>
            <Meta>
              <span>Accepted: PDF, JPG, PNG</span>
              <span>
                No receipt? The entry is flagged for the owner's weekly review.
              </span>
            </Meta>
          </Row>

          <Note>
            Entries are kept locally in this session. The real monthly flow
            persists each entry to the audit log along with the attached
            receipt once the backend is wired.
          </Note>
        </Body>
        <Actions>
          <BtnGhost type="button" onClick={onClose}>
            Cancel
          </BtnGhost>
          <RightActions>
            <BtnGhost type="button" disabled>
              Save as draft
            </BtnGhost>
            <BtnPrimary type="button" onClick={submit} disabled={!canSave}>
              Record expense
            </BtnPrimary>
          </RightActions>
        </Actions>
      </Panel>
    </>
  );
}
