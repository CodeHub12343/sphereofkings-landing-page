"use client";

import { useState, useRef } from "react";
import styled from "styled-components";
import {
  FField, FLabel, FInput, FTextarea, FBtnGold, FBanner,
} from "@/components/feature/primitives";

interface Props { playerDisplayName: string; playerEmail: string; }

const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

export default function ApplicationForm({ playerDisplayName, playerEmail }: Props) {
  const [photos, setPhotos] = useState<Array<{ dataUrl: string; name: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const newPhotos = [...photos];
    for (const f of Array.from(files)) {
      if (newPhotos.length >= MAX_PHOTOS) break;
      if (!ACCEPT.split(",").includes(f.type)) continue;
      if (f.size > MAX_PHOTO_BYTES) continue;
      const reader = new FileReader();
      reader.onload = () => {
        newPhotos.push({ dataUrl: String(reader.result), name: f.name });
        setPhotos([...newPhotos]);
      };
      reader.readAsDataURL(f);
    }
  };

  const removePhoto = (i: number) => {
    const next = [...photos]; next.splice(i, 1); setPhotos(next);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (photos.length === 0) { setState("err"); setMsg("Add at least one photo of your finished design."); return; }
    setBusy(true); setState("idle");
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      description: fd.get("description"),
      proposedPriceDollars: Number(fd.get("proposedPriceDollars")),
      ipDisclosure: fd.get("ipDisclosure"),
      photoDataUrls: photos.map((p) => p.dataUrl),
      agreeTerms: fd.get("agreeTerms") === "on",
    };
    const r = await fetch("/api/license/applications", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    setBusy(false);
    if (!r.ok) { setState("err"); setMsg(data.error ?? "Submission failed."); return; }
    setState("ok");
    setMsg("Application submitted. Our team will review within 7–10 business days and email you at " + playerEmail + ".");
  };

  if (state === "ok") return <FBanner $tone="success">{msg}</FBanner>;

  return (
    <Form onSubmit={submit}>
      <IntroCard>
        You&apos;re applying as <strong style={{ color: "var(--gold-light,#f0c040)" }}>{playerDisplayName}</strong>.
        Decisions and payment instructions will be emailed to <code>{playerEmail}</code>.
      </IntroCard>

      <FField><FLabel>Design title</FLabel>
        <FInput name="title" required maxLength={120} placeholder='e.g. "Aurora Dreams Spherical Puzzle"' /></FField>

      <FField><FLabel>Description</FLabel>
        <FTextarea name="description" required rows={4}
          placeholder="What the design shows, who it's for, what makes it special." /></FField>

      <FField><FLabel>Proposed retail price (USD)</FLabel>
        <FInput name="proposedPriceDollars" required type="number" min={10} max={9999} step={1} placeholder="149" /></FField>

      <FField><FLabel>IP disclosure</FLabel>
        <FTextarea name="ipDisclosure" required rows={3}
          placeholder="Confirm the design is yours and does not infringe any third-party copyright, trademark, or likeness." /></FField>

      <FField>
        <FLabel>Photos of the finished design ({photos.length} / {MAX_PHOTOS})</FLabel>
        <UploadRow>
          {photos.map((p, i) => (
            <Thumb key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.dataUrl} alt={p.name} />
              <RemoveBtn type="button" onClick={() => removePhoto(i)}>×</RemoveBtn>
            </Thumb>
          ))}
          {photos.length < MAX_PHOTOS && (
            <AddBtn type="button" onClick={() => inputRef.current?.click()}>+ Add photos</AddBtn>
          )}
        </UploadRow>
        <input ref={inputRef} type="file" accept={ACCEPT} multiple style={{ display: "none" }}
               onChange={(e) => addPhotos(e.target.files)} />
        <Hint>PNG / JPEG / WEBP, up to 6 MB each. Clear, well-lit, multiple angles.</Hint>
      </FField>

      <CheckRow>
        <input type="checkbox" name="agreeTerms" id="agreeTerms" required />
        <label htmlFor="agreeTerms">
          I understand the <strong>$5,000 submission fee</strong> is only payable
          after admin approval, is non-refundable once production starts, and that
          I will sign a license agreement + NDA/non-compete before my design goes live.
        </label>
      </CheckRow>

      {state === "err" && <FBanner $tone="danger">{msg}</FBanner>}
      <FBtnGold type="submit" disabled={busy} style={{ alignSelf: "flex-start" }}>
        {busy ? "Submitting…" : "Submit application"}
      </FBtnGold>
    </Form>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:14px;`;
const IntroCard = styled.div`
  padding:12px 14px;background:rgba(76,124,224,.06);
  border:1px solid var(--minor-badge,#4c7ce0);border-radius:8px;
  color:var(--text,#f5f0e8);font-size:14px;line-height:1.6;
  code{background:var(--bg3,#111009);padding:2px 6px;border-radius:4px;}
`;
const UploadRow = styled.div`display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;`;
const Thumb = styled.div`
  position:relative;width:90px;height:90px;border-radius:6px;overflow:hidden;
  border:1px solid var(--border,#2a2218);background:#000;
  img{width:100%;height:100%;object-fit:cover;}
`;
const RemoveBtn = styled.button`
  position:absolute;top:2px;right:2px;width:22px;height:22px;border-radius:50%;
  background:rgba(0,0,0,.75);color:#fff;border:none;cursor:pointer;font-size:16px;line-height:1;
`;
const AddBtn = styled.button`
  width:90px;height:90px;border-radius:6px;background:var(--bg2,#0d0b08);
  border:2px dashed var(--border,#2a2218);color:var(--text-muted,#a89880);
  font-family:'Cinzel',serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  &:hover{border-color:var(--gold,#c9a227);color:var(--gold-light,#f0c040);}
`;
const Hint = styled.p`font-size:12px;color:var(--text-muted,#a89880);margin:6px 0 0;`;
const CheckRow = styled.div`
  display:flex;gap:10px;align-items:flex-start;
  input{margin-top:4px;accent-color:var(--gold,#c9a227);}
  label{color:var(--text,#f5f0e8);font-size:14px;line-height:1.65;}
`;
