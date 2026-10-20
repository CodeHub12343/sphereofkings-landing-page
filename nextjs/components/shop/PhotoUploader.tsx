"use client";

import { useRef, useState, useEffect } from "react";
import styled from "styled-components";

interface Props { productSlug: string; }

const STORAGE_KEY = (slug: string) => `sok.photo-upload.${slug}`;
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB — custom-sphere product limit.
const ACCEPT = "image/png,image/jpeg,image/webp";

/**
 * Local-only photo uploader used by "Custom 3D Puzzle Upload" and
 * "Custom Photo-to-3D". The image is stored as a dataURL in
 * localStorage so cart + checkout keep hold of it; it is sent to the
 * server at order confirmation. We never upload until the order is
 * placed, so an abandoned cart does not leak the image anywhere.
 */
export default function PhotoUploader({ productSlug }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(productSlug));
      if (saved) {
        const parsed = JSON.parse(saved) as { dataUrl: string; name: string };
        setPreview(parsed.dataUrl);
        setName(parsed.name);
      }
    } catch {}
  }, [productSlug]);

  const onFile = (f: File | undefined) => {
    setError(null);
    if (!f) return;
    if (!ACCEPT.split(",").includes(f.type)) {
      setError("PNG, JPEG, or WEBP only."); return;
    }
    if (f.size > MAX_BYTES) {
      setError("Image must be 8 MB or smaller."); return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setPreview(dataUrl);
      setName(f.name);
      try {
        localStorage.setItem(
          STORAGE_KEY(productSlug),
          JSON.stringify({ dataUrl, name: f.name, size: f.size, type: f.type }),
        );
      } catch {
        setError("Image saved locally but exceeds browser storage limit. " +
                 "It will still be sent at checkout.");
      }
    };
    reader.onerror = () => setError("Could not read the file.");
    reader.readAsDataURL(f);
  };

  const clear = () => {
    setPreview(null); setName(null); setError(null);
    try { localStorage.removeItem(STORAGE_KEY(productSlug)); } catch {}
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Wrap>
      <Label>Upload your photo</Label>
      <Hint>
        Choose the photo you want on your puzzle (family, pet, artwork — anything you love).
        PNG, JPEG, or WEBP up to 8 MB. We&apos;ll simplify it for 3D printing.
      </Hint>
      {preview ? (
        <Row>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Preview src={preview} alt={name ?? "Uploaded"} />
          <Meta>
            <strong>{name}</strong>
            <Replace onClick={() => inputRef.current?.click()}>Replace</Replace>
            <Clear onClick={clear}>Remove</Clear>
          </Meta>
        </Row>
      ) : (
        <Drop onClick={() => inputRef.current?.click()} type="button">
          <PlusIcon aria-hidden="true">+</PlusIcon>
          <strong>Click to upload</strong>
          <span>or drag an image here</span>
        </Drop>
      )}
      <input ref={inputRef} type="file" accept={ACCEPT} style={{ display: "none" }}
             onChange={(e) => onFile(e.target.files?.[0] ?? undefined)} />
      {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
    </Wrap>
  );
}

const Wrap = styled.div`
  margin:24px 0;padding:16px;border:1px solid var(--border,#2a2218);
  border-radius:10px;background:var(--bg2,#0d0b08);
`;
const Label = styled.div`
  font-family:"Cinzel",Georgia,serif;color:var(--gold-light,#f0c040);
  font-size:0.78rem;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:8px;
`;
const Hint = styled.p`color:var(--text-muted,#a89880);font-size:0.86rem;line-height:1.5;margin:0 0 14px;`;
const Drop = styled.button`
  width:100%;padding:28px;border:2px dashed var(--border,#2a2218);
  background:var(--bg3,#111009);border-radius:10px;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;gap:6px;
  color:var(--text-muted,#a89880);transition:border-color .2s,color .2s;
  strong{color:var(--text,#f5f0e8);font-family:"Cinzel",Georgia,serif;font-size:0.95rem;}
  span{font-size:0.82rem;}
  &:hover{border-color:var(--gold,#c9a227);color:var(--gold-light,#f0c040);}
`;
const PlusIcon = styled.span`
  display:inline-flex;align-items:center;justify-content:center;
  width:40px;height:40px;border-radius:50%;background:rgba(201,162,39,.08);
  color:var(--gold-light,#f0c040);font-size:22px;font-weight:400;
`;
const Row = styled.div`display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;`;
const Preview = styled.img`
  width:140px;height:140px;object-fit:cover;border-radius:8px;
  border:1px solid var(--border,#2a2218);
`;
const Meta = styled.div`
  display:flex;flex-direction:column;gap:8px;color:var(--text,#f5f0e8);font-size:0.9rem;
  strong{font-family:"Cinzel",Georgia,serif;color:var(--gold-light,#f0c040);word-break:break-all;}
`;
const Replace = styled.button`
  background:transparent;color:var(--gold-light,#f0c040);border:1px solid var(--gold,#c9a227);
  border-radius:5px;padding:5px 10px;font-size:0.78rem;cursor:pointer;align-self:flex-start;
  font-family:"Cinzel",Georgia,serif;letter-spacing:0.08em;text-transform:uppercase;
  &:hover{background:rgba(201,162,39,.08);}
`;
const Clear = styled.button`
  background:transparent;color:var(--status-urgent,#ff6b7a);border:1px solid var(--status-urgent,#ff6b7a);
  border-radius:5px;padding:5px 10px;font-size:0.78rem;cursor:pointer;align-self:flex-start;
  font-family:"Cinzel",Georgia,serif;letter-spacing:0.08em;text-transform:uppercase;
  &:hover{background:rgba(255,107,122,.08);}
`;
const ErrorMsg = styled.p`
  color:var(--status-urgent,#ff6b7a);font-size:0.86rem;margin:10px 0 0;
`;
