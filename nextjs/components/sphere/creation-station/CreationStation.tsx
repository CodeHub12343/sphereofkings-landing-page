"use client";

// Creation Station — complete customization portal.
//
// Features:
//  - 9-color palette with unlimited custom HEX slots (1..24) + finish picker
//  - 10 category tabs, each with a dedicated editor
//  - Undo / redo with a 50-step in-memory history
//  - Server-side version history (snapshot on explicit save)
//  - AI prompt panel + conversational design assistant
//  - Image upload with client-side palette extraction + IP rights capture
//  - Double-stack checker configurator with magnetic-alignment template
//  - Personalization (name, date, message, Bible verse)
//  - Live feasibility indicator
//  - Live pricing + print-time estimate
//  - STL export (board / checker set)
//  - Publish to marketplace with royalty share
//  - Create / load / save creations via /api/creation-station/designs
//  - Order pipeline link + draft list link

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import styled from "styled-components";
import SpherePainter from "@/components/sphere/SpherePainter";
import { DESIGN_COLS, DESIGN_ROWS, emptyGrid } from "@/lib/sphere-grid";
import {
  CATEGORIES, Category, CreationConfig, DEFAULT_PALETTE, Feasibility,
  FINISHES, Pricing, Version, defaultConfig,
} from "./types";
import { Card, CardHead, Danger, Err, Field, Grid2, Ok, Primary, Row, Secondary, Small } from "./ui";

const Sphere3D = nextDynamic(() => import("@/components/sphere/Sphere3D"), { ssr: false });

interface Props {
  initialCreation?: {
    id: string; title: string; grid: string[][]; config: CreationConfig;
    isPublic: boolean; marketplaceVotes: number; tags: string[];
    moderationState: "clear" | "flagged" | "blocked"; royaltyBps: number;
  };
  // When false, the editor renders in try-it-first mode: paint / preview /
  // price / AI suggest all work, but save / publish / order prompt the
  // user to sign in. Defaults to true to keep the signed-in flow unchanged.
  signedIn?: boolean;
}

interface HistoryEntry { grid: string[][]; config: CreationConfig; }
const HISTORY_LIMIT = 50;

export default function CreationStation({ initialCreation, signedIn = true }: Props) {
  // Where to send the user if they try something that needs an account.
  const signInHref = typeof window !== "undefined"
    ? `/signin?next=${encodeURIComponent(window.location.pathname)}`
    : "/signin";
  const requireSignIn = (what: string): boolean => {
    if (signedIn) return false;
    alert(`Sign in to ${what}. Your current design stays in the editor.`);
    window.location.href = signInHref;
    return true;
  };
  const [creationId, setCreationId] = useState<string | null>(initialCreation?.id ?? null);
  const [title, setTitle] = useState(initialCreation?.title ?? "Untitled creation");
  const [grid, setGrid] = useState<string[][]>(initialCreation?.grid ?? emptyGrid());
  const [config, setConfig] = useState<CreationConfig>(initialCreation?.config ?? defaultConfig());
  const [category, setCategory] = useState<Category>("exterior");
  const [isPublic, setIsPublic] = useState(initialCreation?.isPublic ?? false);
  const [tags, setTags] = useState<string[]>(initialCreation?.tags ?? []);
  const [moderation, setModeration] = useState(initialCreation?.moderationState ?? "clear");
  const [royaltyBps, setRoyaltyBps] = useState(initialCreation?.royaltyBps ?? 1000);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // Undo / redo history. Fresh app start has one baseline entry.
  const historyRef = useRef<HistoryEntry[]>([{ grid, config }]);
  const indexRef = useRef(0);
  const [, forceRerender] = useState(0);

  const pushHistory = useCallback((g: string[][], c: CreationConfig) => {
    const hist = historyRef.current.slice(0, indexRef.current + 1);
    hist.push({ grid: g, config: c });
    if (hist.length > HISTORY_LIMIT) hist.shift();
    historyRef.current = hist;
    indexRef.current = hist.length - 1;
    forceRerender((n) => n + 1);
  }, []);

  const applyGrid = useCallback((g: string[][]) => { setGrid(g); pushHistory(g, config); }, [config, pushHistory]);
  const applyConfig = useCallback((c: CreationConfig) => { setConfig(c); pushHistory(grid, c); }, [grid, pushHistory]);
  const applyBoth = useCallback((g: string[][], c: CreationConfig) => {
    setGrid(g); setConfig(c); pushHistory(g, c);
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    const h = historyRef.current[indexRef.current];
    setGrid(h.grid); setConfig(h.config);
    forceRerender((n) => n + 1);
  }, []);
  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    const h = historyRef.current[indexRef.current];
    setGrid(h.grid); setConfig(h.config);
    forceRerender((n) => n + 1);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (e.key.toLowerCase() === "z" && e.shiftKey)  { e.preventDefault(); redo(); }
      if (e.key.toLowerCase() === "y")                { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // --- Palette mutators (route through applyConfig) ---
  const setPaletteSlot = (i: number, hex: string) => {
    const next = config.palette.slice();
    const norm = normalizeHex(hex);
    if (!norm) return;
    next[i] = norm;
    applyConfig({ ...config, palette: next });
  };
  const addSlot = () => {
    if (config.palette.length >= 24) return;
    applyConfig({ ...config, palette: [...config.palette, "#808080"] });
  };
  const removeSlot = (i: number) => {
    if (config.palette.length <= 1) return;
    applyConfig({ ...config, palette: config.palette.filter((_, idx) => idx !== i) });
  };
  const resetPalette = () => applyConfig({ ...config, palette: DEFAULT_PALETTE });

  // --- Image upload ---
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const onPickImage = useCallback(async (file: File) => {
    setUploadErr(null);
    if (!file.type.startsWith("image/")) return setUploadErr("Please upload JPG, PNG, or WebP.");
    if (file.size > 10 * 1024 * 1024) return setUploadErr("Image too large (max 10 MB).");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setUploaded(dataUrl);
      const palette = await extractPalette(dataUrl, 9);
      if (palette.length) applyConfig({ ...config, palette });
      // Upload asynchronously so admin moderation sees it.
      fetch("/api/creation-station/upload", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dataUrl, dominantColors: palette, kind: "upload",
          rightsStatement: "I own the rights to this artwork or have permission to use it.",
        }),
      }).catch(() => undefined);
    } catch { setUploadErr("Could not read image."); }
  }, [config, applyConfig]);

  // --- AI prompt + assistant ---
  const [prompt, setPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiTags, setAiTags] = useState<string[]>([]);

  const runAi = useCallback(async () => {
    if (!prompt.trim()) return;
    setAiBusy(true); setAiErr(null);
    try {
      const res = await fetch("/api/creation-station/ai-suggest", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, category, basePalette: config.palette }),
      });
      const data = await res.json();
      if (!res.ok) { setAiErr(data.error ?? "AI error"); return; }
      const sug = data.suggestion;
      const nextConfig = { ...config, palette: sug.palette?.slice(0, 9) ?? config.palette };
      const nextGrid = sug.grid ?? grid;
      applyBoth(nextGrid, nextConfig);
      setAiReply(sug.description);
      setAiTags(sug.themes ?? []);
    } catch { setAiErr("Network error."); }
    finally { setAiBusy(false); }
  }, [prompt, category, config, grid, applyBoth]);

  // Assistant chat
  const [chatMsgs, setChatMsgs] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const askAssistant = useCallback(async () => {
    if (!chatInput.trim()) return;
    const next = [...chatMsgs, { role: "user" as const, content: chatInput.trim() }];
    setChatMsgs(next); setChatInput(""); setChatBusy(true);
    try {
      const res = await fetch("/api/creation-station/ai-chat", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next,
          context: { title, palette: config.palette, hasImage: !!uploaded, category },
        }),
      });
      const data = await res.json();
      setChatMsgs([...next, { role: "assistant", content: data.reply ?? "…" }]);
    } finally { setChatBusy(false); }
  }, [chatInput, chatMsgs, config.palette, title, uploaded, category]);

  // --- Feasibility ---
  const [feasibility, setFeasibility] = useState<Feasibility | null>(null);
  const [checking, setChecking] = useState(false);
  const runFeasibility = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/creation-station/validate", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ grid, config: { ...config, category } }),
      });
      const data = await res.json();
      if (res.ok) setFeasibility(data.feasibility);
    } finally { setChecking(false); }
  }, [grid, config, category]);

  // --- Pricing ---
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [pricingBusy, setPricingBusy] = useState(false);
  const runPricing = useCallback(async () => {
    setPricingBusy(true);
    try {
      const res = await fetch("/api/creation-station/pricing", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ grid, config }),
      });
      const data = await res.json();
      if (res.ok) setPricing(data.pricing);
    } finally { setPricingBusy(false); }
  }, [grid, config]);

  // Auto re-price when grid or finish changes (debounced).
  useEffect(() => {
    const t = setTimeout(runPricing, 450);
    return () => clearTimeout(t);
  }, [runPricing]);

  // --- Save / Snapshot ---
  const saveCreation = useCallback(async (snapshot: boolean) => {
    if (requireSignIn("save your creation")) return;
    setSaving(true); setSaveErr(null); setSaveMsg(null);
    try {
      if (!creationId) {
        const res = await fetch("/api/creation-station/designs", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, grid, config }),
        });
        const data = await res.json();
        if (!res.ok) { setSaveErr(data.error); return; }
        setCreationId(data.creation.id);
        setModeration(data.creation.moderationState);
        setSaveMsg("Saved.");
      } else {
        const res = await fetch(`/api/creation-station/designs/${creationId}`, {
          method: "PATCH", headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, grid, config, snapshot }),
        });
        const data = await res.json();
        if (!res.ok) { setSaveErr(data.error); return; }
        setModeration(data.creation.moderationState);
        setSaveMsg(snapshot ? "Snapshot saved." : "Saved.");
      }
    } catch { setSaveErr("Network error."); }
    finally { setSaving(false); }
  }, [creationId, title, grid, config]);

  // --- Versions ---
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const loadVersions = useCallback(async () => {
    if (!creationId) return;
    const res = await fetch(`/api/creation-station/designs/${creationId}/versions`);
    if (res.ok) {
      const data = await res.json();
      setVersions(data.versions ?? []);
    }
  }, [creationId]);
  const restoreVersion = useCallback(async (v: number) => {
    if (!creationId) return;
    const res = await fetch(`/api/creation-station/designs/${creationId}/versions`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ v }),
    });
    if (res.ok) {
      const fetched = await fetch(`/api/creation-station/designs/${creationId}`);
      const data = await fetched.json();
      applyBoth(data.creation.grid, data.creation.config);
      setTitle(data.creation.title);
    }
  }, [creationId, applyBoth]);

  // --- Publish / unpublish ---
  const publish = useCallback(async () => {
    if (requireSignIn("publish to the marketplace")) return;
    if (!creationId) return;
    if (!config.rightsConfirmed) {
      alert("Confirm you own or have permission to use all uploaded artwork first.");
      return;
    }
    const res = await fetch(`/api/creation-station/designs/${creationId}/publish`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ tags, royaltyBps }),
    });
    if (res.ok) setIsPublic(true);
  }, [creationId, tags, royaltyBps, config.rightsConfirmed]);
  const unpublish = useCallback(async () => {
    if (!creationId) return;
    const res = await fetch(`/api/creation-station/designs/${creationId}/publish`, { method: "DELETE" });
    if (res.ok) setIsPublic(false);
  }, [creationId]);

  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < historyRef.current.length - 1;

  return (
    <Root>
      <TopBar>
        <TitleInput value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
                    placeholder="Name this creation" />
        <Row>
          <Secondary onClick={undo} disabled={!canUndo}>↶ Undo</Secondary>
          <Secondary onClick={redo} disabled={!canRedo}>↷ Redo</Secondary>
          <Secondary onClick={() => saveCreation(true)} disabled={saving}>Snapshot</Secondary>
          <Primary onClick={() => saveCreation(false)} disabled={saving}>
            {saving ? "Saving…" : creationId ? "Save" : "Create draft"}
          </Primary>
        </Row>
      </TopBar>
      {saveMsg && <Ok>{saveMsg}</Ok>}
      {saveErr && <Err>{saveErr}</Err>}
      {moderation !== "clear" && (
        <ModerationBanner $level={moderation}>
          {moderation === "blocked"
            ? "This creation is blocked by moderation and cannot be published or ordered."
            : "This creation is flagged for IP review. Publishing and ordering require manual approval."}
        </ModerationBanner>
      )}

      {!signedIn && (
        <ModerationBanner $level="flagged">
          <strong>Try it first — no account needed.</strong> Paint, preview, and price any design.
          {" "}<a href={signInHref} style={{ color: "var(--gold-light,#f0c040)", textDecoration: "underline" }}>
            Sign in
          </a> when you want to save, publish, or order.
        </ModerationBanner>
      )}

      <Disclosure>
        We offer virtually unlimited color choices and will do our very best to match your selections.
        Actual colors may vary slightly due to filament availability, printing materials, lighting,
        screen displays, and manufacturing processes. We will strive to provide the closest available
        match to your original design.
      </Disclosure>

      <Grid>
        {/* LEFT COLUMN */}
        <Col>
          <Card>
            <CardHead>
              <h3>Nine-color palette</h3>
              <Small>{config.palette.length} / 24</Small>
            </CardHead>
            <PaletteGrid>
              {config.palette.map((c, i) => (
                <SlotWrap key={i}>
                  <SwatchBig style={{ background: c }} />
                  <HexInput value={c} onChange={(e) => setPaletteSlot(i, e.target.value)}
                            maxLength={9} aria-label={`Color ${i + 1}`} />
                  <SlotLabel>Color {i + 1}</SlotLabel>
                  <RemoveBtn onClick={() => removeSlot(i)}>×</RemoveBtn>
                </SlotWrap>
              ))}
              {config.palette.length < 24 && <AddSlotBtn onClick={addSlot}>+ Add</AddSlotBtn>}
            </PaletteGrid>
            <Row>
              <Secondary onClick={resetPalette}>Reset palette</Secondary>
              <FinishSelect value={config.finish}
                            onChange={(e) => applyConfig({ ...config, finish: e.target.value as CreationConfig["finish"] })}>
                {FINISHES.map((f) => <option key={f} value={f}>Finish: {f}</option>)}
              </FinishSelect>
            </Row>
          </Card>

          <Card>
            <CardHead><h3>AI designer</h3></CardHead>
            <textarea rows={3} placeholder="Describe the design you want…"
                      value={prompt} onChange={(e) => setPrompt(e.target.value)}
                      style={{
                        background: "#000", color: "var(--text,#f5f0e8)",
                        border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                        padding: "8px 10px", fontSize: 14, fontFamily: "inherit",
                      }} />
            <Row>
              <Primary onClick={runAi} disabled={aiBusy || !prompt.trim()}>
                {aiBusy ? "Generating…" : "Generate suggestion"}
              </Primary>
              <Secondary onClick={() => setPrompt("")}>Clear</Secondary>
            </Row>
            {aiErr && <Err>{aiErr}</Err>}
            {aiReply && (
              <AiBox>
                <p>{aiReply}</p>
                {aiTags.length > 0 && <Row>{aiTags.map((t) => <Tag key={t}>{t}</Tag>)}</Row>}
              </AiBox>
            )}
          </Card>

          <Card>
            <CardHead><h3>Design assistant</h3></CardHead>
            <ChatLog>
              {chatMsgs.length === 0 && <Small>Ask about colors, checker contrast, pricing, verses, or export.</Small>}
              {chatMsgs.map((m, i) => (
                <ChatMsg key={i} $you={m.role === "user"}>
                  <strong>{m.role === "user" ? "You" : "Assistant"}</strong>
                  <span>{m.content}</span>
                </ChatMsg>
              ))}
            </ChatLog>
            <Row>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                     onKeyDown={(e) => { if (e.key === "Enter" && !chatBusy) askAssistant(); }}
                     placeholder="Ask the assistant…"
                     style={{
                       background: "#000", color: "var(--text,#f5f0e8)", flex: 1,
                       border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                       padding: "8px 10px", fontSize: 13,
                     }} />
              <Primary onClick={askAssistant} disabled={chatBusy || !chatInput.trim()}>Ask</Primary>
            </Row>
          </Card>

          <Card>
            <CardHead><h3>Upload artwork</h3></CardHead>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp"
                   style={{ display: "none" }}
                   onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickImage(f); e.target.value = ""; }} />
            <Row>
              <Primary onClick={() => fileRef.current?.click()}>Choose image…</Primary>
              {uploaded && <Secondary onClick={() => setUploaded(null)}>Remove</Secondary>}
            </Row>
            <Small>JPG, PNG or WebP · up to 10 MB · palette auto-extracted</Small>
            {uploadErr && <Err>{uploadErr}</Err>}
            {uploaded && <img src={uploaded} alt=""
                              style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 6, border: "1px solid var(--border,#2a2218)" }} />}
            <RightsRow>
              <label>
                <input type="checkbox" checked={config.rightsConfirmed}
                       onChange={(e) => applyConfig({ ...config, rightsConfirmed: e.target.checked })} />
                {" "}I own the rights to all uploaded artwork, or have permission to use it.
              </label>
            </RightsRow>
          </Card>

          <Card>
            <CardHead>
              <h3>Feasibility</h3>
              <Secondary onClick={runFeasibility} disabled={checking}>
                {checking ? "Checking…" : "Re-check"}
              </Secondary>
            </CardHead>
            {feasibility ? (
              <Feas $level={feasibility.level}>
                <FeasHead>
                  <strong>
                    {feasibility.level === "ok" ? "Ready for production"
                     : feasibility.level === "review" ? "Needs human review" : "Blocked"}
                  </strong>
                  <span>{feasibility.score}/100</span>
                </FeasHead>
                <ul>{feasibility.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
              </Feas>
            ) : <Small>Click re-check to validate clearances, magnets, stacking, materials.</Small>}
          </Card>
        </Col>

        {/* CENTER COLUMN — editors */}
        <Col>
          <Tabs>
            {CATEGORIES.map((cat) => (
              <TabBtn key={cat.id} $active={category === cat.id} onClick={() => setCategory(cat.id)}>
                {cat.label}
              </TabBtn>
            ))}
          </Tabs>
          <Small>{CATEGORIES.find((c) => c.id === category)?.blurb}</Small>

          {category === "exterior" || category === "board" ? (
            <SpherePainter
              grid={grid} onGridChange={applyGrid}
              title={title} onTitleChange={setTitle}
              designId={undefined}
            />
          ) : category === "checkers" ? (
            <CheckerEditor config={config} onChange={applyConfig} />
          ) : category === "personalization" ? (
            <PersonalEditor config={config} onChange={applyConfig} />
          ) : category === "imperial" ? (
            <ImperialEditor config={config} onChange={applyConfig} />
          ) : category === "lid" ? (
            <SurfaceEditor label="Sphere lid" hint="Top artwork, logo placement, engraving on the upper hemisphere."
                           field="lid" config={config} onChange={applyConfig} />
          ) : category === "base" ? (
            <SurfaceEditor label="Base & stand" hint="Stand color, engraving, approved stand styles."
                           field="base" config={config} onChange={applyConfig} />
          ) : category === "puzzle" ? (
            <SurfaceEditor label="Puzzle system" hint="Photo puzzles and AI artwork inside approved geometry."
                           field="puzzle" config={config} onChange={applyConfig} />
          ) : category === "accessories" ? (
            <AccessoriesEditor config={config} onChange={applyConfig} />
          ) : (
            <PackagingEditor config={config} onChange={applyConfig} />
          )}
        </Col>

        {/* RIGHT COLUMN */}
        <Col>
          <Card>
            <CardHead><h3>Live preview</h3></CardHead>
            <Sphere3D grid={grid} />
          </Card>

          <Card>
            <CardHead>
              <h3>Pricing</h3>
              <Small>{pricingBusy ? "updating…" : "live"}</Small>
            </CardHead>
            {pricing ? (
              <>
                <PricingLines>
                  {pricing.lines.map((l, i) => (
                    <li key={i}>
                      <span>{l.label} × {l.quantity}</span>
                      <span>{fmt(l.unitCents * l.quantity)}</span>
                    </li>
                  ))}
                </PricingLines>
                <Totals>
                  <div><span>Subtotal</span><span>{fmt(pricing.subtotalCents)}</span></div>
                  <div><span>Shipping (est.)</span><span>{fmt(pricing.shippingCents)}</span></div>
                  <div><span>Tax (est.)</span><span>{fmt(pricing.taxCents)}</span></div>
                  <div className="total"><span>Total</span><span>{fmt(pricing.totalCents)}</span></div>
                  <div className="meta">Print time ≈ {fmtMin(pricing.printMinutes)}</div>
                </Totals>
                {pricing.estimateNotes.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted,#a89880)", fontSize: 12 }}>
                    {pricing.estimateNotes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                )}
              </>
            ) : <Small>Live pricing updates as you edit.</Small>}
          </Card>

          <Card>
            <CardHead><h3>Export & order</h3></CardHead>
            <Row>
              <Secondary as="a" href={creationId ? `/api/creation-station/designs/${creationId}/export?part=board` : "#"}
                         onClick={(e) => { if (!creationId) { e.preventDefault(); alert("Save first."); } }}>
                Download board STL
              </Secondary>
              <Secondary as="a" href={creationId ? `/api/creation-station/designs/${creationId}/export?part=checkers` : "#"}
                         onClick={(e) => { if (!creationId) { e.preventDefault(); alert("Save first."); } }}>
                Download checker STL
              </Secondary>
            </Row>
            <Field>
              <label>Order quantity</label>
              <input type="number" min={1} max={500} value={config.quantity}
                     onChange={(e) => applyConfig({ ...config, quantity: Math.max(1, Math.min(500, +e.target.value || 1)) })} />
            </Field>
            <Field>
              <label>Gift message (optional)</label>
              <textarea rows={2} maxLength={500} value={config.giftMessage ?? ""}
                        onChange={(e) => applyConfig({ ...config, giftMessage: e.target.value })} />
            </Field>
            <Primary as={Link as unknown as "a"}
                     href={creationId ? `/sphere/creation-station/${creationId}/order` : "#"}
                     onClick={(e) => { if (!creationId) { e.preventDefault(); alert("Save first."); } }}>
              Continue to checkout →
            </Primary>
          </Card>

          <Card>
            <CardHead>
              <h3>Marketplace</h3>
              <Small>{isPublic ? "Public" : "Private"}</Small>
            </CardHead>
            <Field>
              <label>Tags (comma separated)</label>
              <input value={tags.join(", ")}
                     onChange={(e) => setTags(e.target.value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8))}
                     placeholder="e.g. faith, royal, memorial" />
            </Field>
            <Field>
              <label>Royalty share: {(royaltyBps / 100).toFixed(1)}%</label>
              <input type="range" min={0} max={3000} step={100}
                     value={royaltyBps} onChange={(e) => setRoyaltyBps(+e.target.value)} />
            </Field>
            <Row>
              {isPublic
                ? <Danger onClick={unpublish}>Unpublish</Danger>
                : <Primary onClick={publish} disabled={!creationId || moderation === "blocked"}>Publish</Primary>}
            </Row>
            <Small>Publishing lists this creation on the marketplace so other customers can buy it. You earn royalty on every order.</Small>
          </Card>

          <Card>
            <CardHead>
              <h3>Version history</h3>
              <Secondary onClick={() => { setVersionsOpen(!versionsOpen); if (!versionsOpen) loadVersions(); }}>
                {versionsOpen ? "Hide" : "Show"}
              </Secondary>
            </CardHead>
            {versionsOpen && (
              versions.length === 0 ? <Small>No snapshots yet. Click “Snapshot” to save one.</Small> : (
                <VersionList>
                  {versions.slice().reverse().map((v) => (
                    <li key={v.v}>
                      <span>#{v.v} · {new Date(v.snapshotAt).toLocaleString()}</span>
                      <Secondary onClick={() => restoreVersion(v.v)}>Restore</Secondary>
                    </li>
                  ))}
                </VersionList>
              )
            )}
          </Card>

          <Card>
            <CardHead><h3>Production pipeline</h3></CardHead>
            <Pipeline>
              {["Draft", "AI processing", "Geometry check", "Needs review", "Approved", "Printing", "Shipped"].map((p, i) => (
                <li key={p}><span>{i + 1}</span>{p}</li>
              ))}
            </Pipeline>
          </Card>

          <Card>
            <CardHead><h3>More</h3></CardHead>
            <Row>
              <Secondary as={Link as unknown as "a"} href="/sphere/creation-station/drafts">My drafts</Secondary>
              <Secondary as={Link as unknown as "a"} href="/sphere/creation-station/orders">My orders</Secondary>
              <Secondary as={Link as unknown as "a"} href="/sphere/creation-station/marketplace">Browse marketplace</Secondary>
            </Row>
          </Card>
        </Col>
      </Grid>
    </Root>
  );
}

// ---------- Editors ----------

function CheckerEditor({ config, onChange }: { config: CreationConfig; onChange: (c: CreationConfig) => void }) {
  const u = (patch: Partial<CreationConfig["checker"]>) =>
    onChange({ ...config, checker: { ...config.checker, ...patch } });
  return (
    <EditorBox>
      <h3>Double-stack checkers</h3>
      <p>Top and bottom pieces customize separately. Magnetic alignment and stack height are locked by the engineering template so decorations never block fit.</p>
      <Grid2>
        <Field><label>Top piece</label>
          <ColorRow>{config.palette.map((c, i) =>
            <Dot key={i} style={{ background: c }} $active={config.checker.topColor === c} onClick={() => u({ topColor: c })} />)}
          </ColorRow>
        </Field>
        <Field><label>Bottom piece</label>
          <ColorRow>{config.palette.map((c, i) =>
            <Dot key={i} style={{ background: c }} $active={config.checker.bottomColor === c} onClick={() => u({ bottomColor: c })} />)}
          </ColorRow>
        </Field>
      </Grid2>
      <label><input type="checkbox" checked={config.checker.crown} onChange={(e) => u({ crown: e.target.checked })} /> Crown on king</label>
      {config.checker.crown && (
        <Field><label>Crown color</label>
          <ColorRow>{config.palette.map((c, i) =>
            <Dot key={i} style={{ background: c }} $active={config.checker.crownColor === c} onClick={() => u({ crownColor: c })} />)}
          </ColorRow>
        </Field>
      )}
      <Grid2>
        <Field><label>Symbol</label>
          <input value={config.checker.symbol} onChange={(e) => u({ symbol: e.target.value })} maxLength={24} />
        </Field>
        <Field><label>Engraving</label>
          <input value={config.checker.engraving} onChange={(e) => u({ engraving: e.target.value })} maxLength={24} />
        </Field>
      </Grid2>
      <StackPreview top={config.checker.topColor} bottom={config.checker.bottomColor}
                    crown={config.checker.crown} crownColor={config.checker.crownColor} />
    </EditorBox>
  );
}

function PersonalEditor({ config, onChange }: { config: CreationConfig; onChange: (c: CreationConfig) => void }) {
  const u = (patch: Partial<CreationConfig["personal"]>) =>
    onChange({ ...config, personal: { ...config.personal, ...patch } });
  return (
    <EditorBox>
      <h3>Personalization</h3>
      <Grid2>
        <Field><label>Name</label><input value={config.personal.name} onChange={(e) => u({ name: e.target.value })} maxLength={40} /></Field>
        <Field><label>Date</label><input type="date" value={config.personal.date} onChange={(e) => u({ date: e.target.value })} /></Field>
      </Grid2>
      <Field><label>Message</label><textarea rows={3} maxLength={240} value={config.personal.message} onChange={(e) => u({ message: e.target.value })} /></Field>
      <Field><label>Bible verse / quote</label><input value={config.personal.verse} maxLength={120} onChange={(e) => u({ verse: e.target.value })} placeholder="e.g. Philippians 4:13" /></Field>
      <label><input type="checkbox" checked={!!config.memorial} onChange={(e) => onChange({ ...config, memorial: e.target.checked })} /> Mark as memorial edition</label>
    </EditorBox>
  );
}

function ImperialEditor({ config, onChange }: { config: CreationConfig; onChange: (c: CreationConfig) => void }) {
  const cat = config.categories.imperial ?? {};
  const u = (patch: typeof cat) => onChange({ ...config, categories: { ...config.categories, imperial: { ...cat, ...patch } } });
  return (
    <EditorBox>
      <h3>Imperial Kings</h3>
      <p>Royal pieces follow the locked piece template. Pick a palette subset and add an inscription.</p>
      <Field><label>Preferred palette</label>
        <ColorRow>{config.palette.map((c, i) =>
          <Dot key={i} style={{ background: c }} $active={cat.palette?.includes(c) ?? false}
               onClick={() => {
                 const p = cat.palette ?? [];
                 u({ palette: p.includes(c) ? p.filter((x) => x !== c) : [...p, c].slice(0, 4) });
               }} />)}
        </ColorRow>
      </Field>
      <Field><label>Royal inscription</label>
        <input value={cat.text ?? ""} maxLength={60} onChange={(e) => u({ text: e.target.value })} placeholder="e.g. Rex Regum" />
      </Field>
    </EditorBox>
  );
}

function SurfaceEditor({
  label, hint, field, config, onChange,
}: {
  label: string; hint: string; field: string;
  config: CreationConfig; onChange: (c: CreationConfig) => void;
}) {
  const cat = config.categories[field] ?? {};
  const u = (patch: typeof cat) => onChange({ ...config, categories: { ...config.categories, [field]: { ...cat, ...patch } } });
  return (
    <EditorBox>
      <h3>{label}</h3>
      <p>{hint}</p>
      <Field><label>Accent color</label>
        <ColorRow>{config.palette.map((c, i) =>
          <Dot key={i} style={{ background: c }} $active={(cat.palette?.[0]) === c} onClick={() => u({ palette: [c] })} />)}
        </ColorRow>
      </Field>
      <Field><label>Text / engraving</label>
        <input value={cat.text ?? ""} maxLength={120} onChange={(e) => u({ text: e.target.value })} />
      </Field>
      <Field><label>Notes to production</label>
        <textarea rows={2} value={cat.notes ?? ""} maxLength={300} onChange={(e) => u({ notes: e.target.value })} />
      </Field>
    </EditorBox>
  );
}

function AccessoriesEditor({ config, onChange }: { config: CreationConfig; onChange: (c: CreationConfig) => void }) {
  const u = (patch: Partial<CreationConfig["mechanics"]>) =>
    onChange({ ...config, mechanics: { ...config.mechanics, ...patch } });
  return (
    <EditorBox>
      <h3>Accessories</h3>
      <p>Toggle the engineered add-ons that ship with your Sphere of Kings.</p>
      <label><input type="checkbox" checked={config.mechanics.magneticStacking} onChange={(e) => u({ magneticStacking: e.target.checked })} /> Magnetic stacking (required for double-stack checkers)</label>
      <label><input type="checkbox" checked={config.mechanics.reinforcedLid} onChange={(e) => u({ reinforcedLid: e.target.checked })} /> Reinforced lid</label>
      <label><input type="checkbox" checked={config.mechanics.internalStorage} onChange={(e) => u({ internalStorage: e.target.checked })} /> Internal piece storage</label>
    </EditorBox>
  );
}

function PackagingEditor({ config, onChange }: { config: CreationConfig; onChange: (c: CreationConfig) => void }) {
  const cat = config.categories.packaging ?? {};
  const u = (patch: typeof cat) => onChange({ ...config, categories: { ...config.categories, packaging: { ...cat, ...patch } } });
  return (
    <EditorBox>
      <h3>Packaging</h3>
      <p>Gift presentation, box label, included card.</p>
      <Field><label>Label text</label>
        <input value={cat.text ?? ""} maxLength={60} onChange={(e) => u({ text: e.target.value })} />
      </Field>
      <Field><label>Gift message</label>
        <textarea rows={3} maxLength={500} value={config.giftMessage ?? ""}
                  onChange={(e) => onChange({ ...config, giftMessage: e.target.value })} />
      </Field>
    </EditorBox>
  );
}

function StackPreview({ top, bottom, crown, crownColor }: { top: string; bottom: string; crown: boolean; crownColor: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 16,
                  background: "#000", borderRadius: 8, border: "1px solid var(--border,#2a2218)" }}>
      {crown && <Crown style={{ background: crownColor }} />}
      <Disc style={{ background: top }} />
      <Disc style={{ background: bottom, marginTop: -6 }} />
      <Small>Locked magnetic alignment · stack height within tolerance</Small>
    </div>
  );
}

// ---------- Helpers ----------

function fmt(c: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100);
}
function fmtMin(m: number): string {
  const h = Math.floor(m / 60); return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}
function normalizeHex(input: string): string | null {
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(input.trim());
  return m ? "#" + m[1].toUpperCase() : null;
}
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = () => rej(r.error); r.readAsDataURL(file); });
}
async function extractPalette(dataUrl: string, k: number): Promise<string[]> {
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl; });
  const w = 64, h = 64;
  const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d"); if (!ctx) return [];
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  const counts = new Map<number, number>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    const r = data[i] >> 4, g = data[i + 1] >> 4, b = data[i + 2] >> 4;
    const key = (r << 8) | (g << 4) | b;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(([key]) => {
    const r = ((key >> 8) & 0xf) * 17, g = ((key >> 4) & 0xf) * 17, b = (key & 0xf) * 17;
    return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
  });
}

// ---------- Styles ----------

const Root = styled.div`display:flex;flex-direction:column;gap:12px;`;
const TopBar = styled.div`display:flex;gap:10px;align-items:center;flex-wrap:wrap;`;
const TitleInput = styled.input`
  flex:1;min-width:200px;background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
  border:1px solid var(--border,#2a2218);border-radius:6px;padding:8px 10px;font-size:15px;
`;
const Disclosure = styled.div`
  background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);
  border-left:3px solid var(--gold,#c9a227);color:var(--text-muted,#a89880);
  padding:10px 12px;border-radius:8px;font-size:12px;line-height:1.5;
`;
const ModerationBanner = styled.div<{ $level: "flagged" | "blocked" | "clear" }>`
  background:${(p) => p.$level === "blocked" ? "rgba(255,107,122,.08)" : "rgba(201,162,39,.08)"};
  border:1px solid ${(p) => p.$level === "blocked" ? "var(--status-urgent,#ff6b7a)" : "var(--gold,#c9a227)"};
  color:${(p) => p.$level === "blocked" ? "var(--status-urgent,#ff6b7a)" : "var(--gold-light,#f0c040)"};
  padding:10px 12px;border-radius:8px;font-size:13px;
`;
const Grid = styled.div`
  display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
  align-items:flex-start;
`;
const Col = styled.div`display:flex;flex-direction:column;gap:14px;min-width:0;`;
const PaletteGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:8px;`;
const SlotWrap = styled.div`
  position:relative;display:flex;flex-direction:column;gap:4px;
  background:#000;border:1px solid var(--border,#2a2218);border-radius:8px;padding:6px;
`;
const SwatchBig = styled.div`height:28px;border-radius:4px;border:1px solid #0006;`;
const HexInput = styled.input`
  background:transparent;color:var(--text,#f5f0e8);border:none;
  font-family:ui-monospace,monospace;font-size:12px;text-align:center;padding:0;
`;
const SlotLabel = styled.span`color:var(--text-muted,#a89880);font-size:10px;text-align:center;`;
const RemoveBtn = styled.button`
  position:absolute;top:2px;right:2px;background:transparent;color:var(--text-muted,#a89880);
  border:none;cursor:pointer;font-size:14px;padding:0 4px;
`;
const AddSlotBtn = styled.button`
  background:transparent;color:var(--gold-light,#f0c040);
  border:1px dashed var(--border,#2a2218);border-radius:8px;cursor:pointer;
  font-size:12px;min-height:72px;
`;
const FinishSelect = styled.select`
  background:#000;color:var(--text,#f5f0e8);border:1px solid var(--border,#2a2218);
  border-radius:6px;padding:8px 10px;font-size:13px;
`;
const AiBox = styled.div`
  background:#000;border:1px solid var(--border,#2a2218);border-radius:8px;
  padding:10px;font-size:13px;color:var(--text,#f5f0e8);
  p{margin:0 0 8px;}
`;
const Tag = styled.span`
  background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);
  border-radius:999px;padding:2px 10px;font-size:11px;color:var(--text-muted,#a89880);
`;
const RightsRow = styled.div`
  font-size:12px;color:var(--text-muted,#a89880);line-height:1.6;
  label{display:flex;gap:8px;align-items:flex-start;}
`;
const Feas = styled.div<{ $level: "ok" | "review" | "blocked" }>`
  background:#000;border-radius:8px;padding:10px;
  border:1px solid ${(p) => p.$level === "ok" ? "var(--status-online,#4fb07d)" :
                            p.$level === "review" ? "var(--gold,#c9a227)" :
                            "var(--status-urgent,#ff6b7a)"};
  ul{margin:6px 0 0;padding-left:18px;color:var(--text-muted,#a89880);font-size:12px;line-height:1.6;}
`;
const FeasHead = styled.div`display:flex;justify-content:space-between;color:var(--text,#f5f0e8);font-size:13px;`;
const Tabs = styled.div`display:flex;flex-wrap:wrap;gap:6px;`;
const TabBtn = styled.button<{ $active: boolean }>`
  background:${(p) => p.$active ? "var(--gold,#c9a227)" : "transparent"};
  color:${(p) => p.$active ? "#000" : "var(--text,#f5f0e8)"};
  border:1px solid ${(p) => p.$active ? "var(--gold,#c9a227)" : "var(--border,#2a2218)"};
  border-radius:999px;padding:6px 12px;font-size:12px;cursor:pointer;
`;
const EditorBox = styled.div`
  background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);
  border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px;
  h3{margin:0;color:var(--gold-light,#f0c040);font-size:15px;}
  p{margin:0;color:var(--text-muted,#a89880);font-size:12px;line-height:1.5;}
  label{color:var(--text-muted,#a89880);font-size:12px;display:flex;gap:6px;align-items:center;}
`;
const ColorRow = styled.div`display:flex;flex-wrap:wrap;gap:6px;`;
const Dot = styled.button<{ $active: boolean }>`
  width:24px;height:24px;border-radius:50%;cursor:pointer;padding:0;
  border:2px solid ${(p) => p.$active ? "var(--gold-light,#f0c040)" : "var(--border,#2a2218)"};
`;
const Disc = styled.div`
  width:120px;height:28px;border-radius:50%/60%;
  border:1px solid #0008;box-shadow:inset 0 -4px 6px #0006, 0 4px 10px #000a;
`;
const Crown = styled.div`
  width:36px;height:18px;
  clip-path:polygon(0% 100%,10% 20%,25% 80%,40% 10%,55% 80%,70% 10%,85% 80%,100% 20%,100% 100%);
  margin-bottom:-4px;
`;
const PricingLines = styled.ul`
  list-style:none;margin:0;padding:0;font-size:13px;color:var(--text,#f5f0e8);
  li{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border,#2a2218);}
`;
const Totals = styled.div`
  display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--text-muted,#a89880);
  div{display:flex;justify-content:space-between;}
  .total{color:var(--gold-light,#f0c040);font-weight:600;font-size:15px;border-top:1px solid var(--border,#2a2218);padding-top:6px;}
  .meta{font-size:11px;color:var(--text-muted,#a89880);}
`;
const VersionList = styled.ul`
  list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto;
  li{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--text-muted,#a89880);}
`;
const Pipeline = styled.ol`
  list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;
  li{display:flex;gap:10px;align-items:center;color:var(--text-muted,#a89880);font-size:13px;}
  span{width:22px;height:22px;border-radius:50%;background:transparent;border:1px solid var(--border,#2a2218);
       display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;}
`;
const ChatLog = styled.div`
  background:#000;border:1px solid var(--border,#2a2218);border-radius:6px;
  padding:8px;max-height:220px;overflow:auto;display:flex;flex-direction:column;gap:8px;
`;
const ChatMsg = styled.div<{ $you: boolean }>`
  font-size:12px;line-height:1.5;color:${(p) => p.$you ? "var(--text,#f5f0e8)" : "var(--text-muted,#a89880)"};
  strong{color:${(p) => p.$you ? "var(--gold-light,#f0c040)" : "var(--gold,#c9a227)"};margin-right:6px;}
`;
