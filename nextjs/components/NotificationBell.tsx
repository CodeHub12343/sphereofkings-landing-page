"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import AppIcon from "@/components/app/AppIcon";

interface Note {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
}

export default function NotificationBell() {
  const [items, setItems] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const refetch = useCallback(async () => {
    try {
      const r = await fetch("/api/notifications", { cache: "no-store" });
      if (!r.ok) return;
      const data = await r.json();
      setItems(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    void refetch();
    const id = setInterval(refetch, 20_000);
    return () => clearInterval(id);
  }, [refetch]);

  // The bell lives in persistent app chrome, so close the panel when a
  // notification link navigates, or on a tap anywhere outside it.
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = async () => {
    await fetch("/api/notifications", { method: "POST" });
    setUnread(0);
    void refetch();
  };

  return (
    <Wrap ref={wrapRef}>
      <Btn
        onClick={() => { setOpen(!open); if (!open && unread > 0) void markRead(); }}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
      >
        <AppIcon name="bell" />
        {unread > 0 && <Badge>{unread > 9 ? "9+" : unread}</Badge>}
      </Btn>
      {open && (
        <Panel>
          <Header>Notifications</Header>
          {items.length === 0 ? (
            <Empty>No notifications yet.</Empty>
          ) : items.slice(0, 20).map((n) => <NoteRow key={n.id} note={n} />)}
          <Footer>
            <Link href="/me/inbox" onClick={() => setOpen(false)}>Open inbox</Link>
          </Footer>
        </Panel>
      )}
    </Wrap>
  );
}

function NoteRow({ note }: { note: Note }) {
  const label = labelOf(note);
  const href = linkOf(note);
  return (
    <Row $unread={!note.readAt}>
      <Link href={href} style={{ color: "inherit", textDecoration: "none" }}>
        <span>{label}</span>
        <Time>{new Date(note.createdAt).toLocaleString()}</Time>
      </Link>
    </Row>
  );
}

function labelOf(n: Note): string {
  const p = n.payload as Record<string, string | undefined>;
  switch (n.kind) {
    case "challenge-received": return `${p.fromDisplayName ?? "Someone"} challenged you.`;
    case "opponent-joined": return `${p.fromDisplayName ?? "Someone"} joined your game — your move.`;
    case "match-your-turn": return "It's your turn.";
    case "match-ended": return `Match ended${p.outcome ? ` — ${p.outcome}` : ""}.`;
    case "message-received": return `${p.fromDisplayName ?? "Someone"} sent you a message.`;
    case "consent-granted": return "Parental consent granted. Welcome aboard.";
    case "report-resolved": return "Your report was resolved.";
    case "tournament-starting": return `${p.name ?? "A tournament"} is starting.`;
    default: return n.kind;
  }
}

function linkOf(n: Note): string {
  const p = n.payload as Record<string, string | undefined>;
  if (n.kind === "challenge-received" || n.kind === "opponent-joined" || n.kind === "match-your-turn" || n.kind === "match-ended") {
    return p.matchId ? `/match/${p.matchId}` : "/matches";
  }
  if (n.kind === "message-received") return p.conversationId ? `/me/inbox/${p.conversationId}` : "/me/inbox";
  if (n.kind === "tournament-starting") return p.slug ? `/tournaments/${p.slug}` : "/tournaments";
  return "/me";
}

const Wrap = styled.div`position:relative;`;
const Btn = styled.button`
  display:inline-flex;align-items:center;justify-content:center;
  width:40px;height:40px;border-radius:50%;
  background:transparent;border:none;color:var(--text,#f5f0e8);
  cursor:pointer;position:relative;
  &:active{background:rgba(201,162,39,.12);}
`;
const Badge = styled.span`
  position:absolute;top:-2px;right:-2px;background:var(--status-urgent,#ff6b7a);
  color:#fff;border-radius:10px;padding:1px 5px;font-size:10px;font-weight:700;
`;
const Panel = styled.div`
  position:absolute;top:44px;right:0;width:320px;max-width:calc(100vw - 16px);
  background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);
  border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.4);z-index:50;
  max-height:70vh;overflow:auto;
`;
const Header = styled.div`
  padding:10px 12px;border-bottom:1px solid var(--border,#2a2218);
  font-size:12px;color:var(--text-muted,#a89880);text-transform:uppercase;letter-spacing:.08em;
`;
const Row = styled.div<{ $unread: boolean }>`
  padding:10px 12px;border-bottom:1px solid var(--border,#2a2218);font-size:13px;
  background:${(p)=>p.$unread?"rgba(201,162,39,.06)":"transparent"};
  color:var(--text,#f5f0e8);
  display:flex;flex-direction:column;
`;
const Time = styled.span`font-size:11px;color:var(--text-muted,#a89880);margin-top:3px;`;
const Empty = styled.div`padding:16px;text-align:center;color:var(--text-muted,#a89880);font-size:13px;`;
const Footer = styled.div`
  padding:8px 12px;text-align:center;
  a{color:var(--gold-light,#f0c040);font-size:13px;text-decoration:none;}
`;
