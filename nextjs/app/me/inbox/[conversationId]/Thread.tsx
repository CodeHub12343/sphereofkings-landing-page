"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import ReportButton from "@/components/ReportButton";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  moderationStatus?: "clean" | "flagged" | "blocked";
}

interface Props {
  conversationId: string;
  other: { id: string; username: string; displayName: string };
  meId: string;
  initialMessages: Message[];
}

export default function Thread({ conversationId, other, meId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const refetch = useCallback(async () => {
    try {
      const r = await fetch(`/api/messages/${conversationId}`, { cache: "no-store" });
      if (!r.ok) return;
      const data = await r.json();
      setMessages(data.messages ?? []);
    } catch {}
  }, [conversationId]);

  useEffect(() => {
    const id = setInterval(refetch, 10_000);
    return () => clearInterval(id);
  }, [refetch]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    if (!body.trim()) return;
    setSending(true); setError(null);
    try {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ toUsername: other.username, body }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Could not send."); return; }
      setBody("");
      void refetch();
    } finally { setSending(false); }
  };

  return (
    <>
      <TopRow>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 20 }}>
          <Link href={`/u/${other.username}`} style={{ color: "inherit", textDecoration: "none" }}>
            {other.displayName}
          </Link>
          <span style={{ color: "var(--text-muted,#a89880)", fontSize: 13, marginLeft: 8 }}>@{other.username}</span>
        </h1>
        <ReportButton subjectKind="conversation" subjectId={conversationId} label="Report conversation" />
      </TopRow>
      <Scroll>
        {messages.length === 0 ? (
          <Empty>No messages yet. Say hello.</Empty>
        ) : messages.map((m) => (
          <Bubble key={m.id} $mine={m.senderId === meId}>
            <Body>{m.body}</Body>
            <Meta>
              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {m.moderationStatus === "flagged" && <Flag> · flagged</Flag>}
            </Meta>
          </Bubble>
        ))}
        <div ref={endRef} />
      </Scroll>
      <Composer>
        <textarea rows={2} value={body} maxLength={2000}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a message…" />
        {error && <Err>{error}</Err>}
        <Row>
          <Primary onClick={send} disabled={sending || !body.trim()}>
            {sending ? "Sending…" : "Send"}
          </Primary>
        </Row>
      </Composer>
    </>
  );
}

const TopRow = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;`;
const Scroll = styled.div`
  display:flex;flex-direction:column;gap:10px;max-height:60vh;overflow-y:auto;padding:4px;
  margin-bottom:16px;
`;
const Empty = styled.div`color:var(--text-muted,#a89880);text-align:center;padding:30px 10px;`;
const Bubble = styled.div<{ $mine: boolean }>`
  max-width:70%;align-self:${(p)=>p.$mine?"flex-end":"flex-start"};
  padding:10px 12px;border-radius:10px;
  background:${(p)=>p.$mine?"rgba(201,162,39,.12)":"var(--bg2,#0d0b08)"};
  border:1px solid ${(p)=>p.$mine?"var(--gold,#c9a227)":"var(--border,#2a2218)"};
  color:var(--text,#f5f0e8);
`;
const Body = styled.div`font-size:14px;white-space:pre-wrap;word-wrap:break-word;`;
const Meta = styled.div`font-size:11px;color:var(--text-muted,#a89880);margin-top:4px;`;
const Flag = styled.span`color:var(--status-waiting,#e0a94a);`;
const Composer = styled.div`
  display:flex;flex-direction:column;gap:8px;
  textarea{
    background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:8px;padding:10px 12px;font-size:14px;font-family:inherit;resize:vertical;
  }
`;
const Row = styled.div`display:flex;gap:10px;justify-content:flex-end;`;
const Primary = styled.button`
  background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:9px 14px;font-size:14px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);} &:disabled{opacity:.6;}
`;
const Err = styled.div`color:var(--status-urgent,#ff6b7a);font-size:12px;`;
