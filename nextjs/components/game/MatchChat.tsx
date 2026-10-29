"use client";

// Live chat panel for a match. Both players see the same message
// list; spectators see it read-only. Push updates come via Pusher
// when configured; a 5s poll keeps things in sync as a fallback.

import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

type ChatMessage = {
  playerId: string;
  displayName: string;
  text: string;
  iso: string;
};

type Props = {
  matchId: string;
  viewerId: string;        // "spectator" for read-only
  readOnly?: boolean;
  initialMessages?: ChatMessage[];
};

export default function MatchChat({
  matchId,
  viewerId,
  readOnly = false,
  initialMessages = [],
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refetch = useCallback(async () => {
    try {
      const r = await fetch(`/api/matches/${matchId}/chat`, { cache: "no-store" });
      if (!r.ok) return;
      const data = (await r.json()) as { messages?: ChatMessage[] };
      setMessages(data.messages ?? []);
    } catch {}
  }, [matchId]);

  // Poll as a fallback. Pusher push would be nicer but this is cheap
  // and the match channel we'd piggyback on isn't guaranteed to deliver
  // chat events to spectators without extra setup.
  useEffect(() => {
    refetch();
    const id = setInterval(refetch, 5000);
    return () => clearInterval(id);
  }, [refetch]);

  // Auto-scroll to latest when the message count changes.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const send = async () => {
    const t = text.trim();
    if (!t || readOnly) return;
    setSending(true);
    try {
      const r = await fetch(`/api/matches/${matchId}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      if (r.ok) {
        setText("");
        void refetch();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <Head>Chat {readOnly && <small>(spectator — read-only)</small>}</Head>
      <List ref={scrollRef}>
        {messages.length === 0 ? (
          <Empty>No messages yet. {readOnly ? "" : "Say gl, hf."}</Empty>
        ) : (
          messages.map((m, i) => (
            <Line key={i} $me={m.playerId === viewerId}>
              <Who>{m.displayName}</Who>
              <Text>{m.text}</Text>
            </Line>
          ))
        )}
      </List>
      {!readOnly && (
        <Composer onSubmit={(e) => { e.preventDefault(); void send(); }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message your opponent…"
            maxLength={240}
            disabled={sending}
          />
          <button type="submit" disabled={sending || !text.trim()}>
            Send
          </button>
        </Composer>
      )}
    </Card>
  );
}

const Card = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
`;

const Head = styled.h3`
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a89880;
  font-weight: 700;
  small {
    font-size: 0.7rem;
    color: #5a4a38;
    text-transform: none;
    letter-spacing: 0.04em;
    margin-left: 6px;
    font-weight: 400;
  }
`;

const List = styled.div`
  flex: 1;
  min-height: 120px;
  overflow-y: auto;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(240, 192, 64, 0.3); border-radius: 2px; }
`;

const Empty = styled.div`
  color: #5a4a38;
  font-family: "Inter", sans-serif;
  font-size: 0.84rem;
  padding: 20px 0;
  text-align: center;
`;

const Line = styled.div<{ $me: boolean }>`
  background: ${(p) => (p.$me ? "rgba(240, 192, 64, 0.08)" : "#1a1612")};
  border: 1px solid ${(p) => (p.$me ? "#c9a227" : "#2e2618")};
  border-radius: 8px;
  padding: 6px 10px;
  max-width: 85%;
  align-self: ${(p) => (p.$me ? "flex-end" : "flex-start")};
`;

const Who = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a89880;
  font-weight: 700;
  margin-bottom: 2px;
`;

const Text = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #f5f0e8;
  line-height: 1.4;
  word-wrap: break-word;
`;

const Composer = styled.form`
  display: flex;
  gap: 6px;
  input {
    flex: 1;
    background: #1a1612;
    border: 1px solid #2e2618;
    border-radius: 6px;
    padding: 7px 10px;
    color: #f5f0e8;
    font-family: "Inter", sans-serif;
    font-size: 0.88rem;
    &:focus { outline: 0; border-color: #c9a227; }
  }
  button {
    background: #c9a227;
    color: #0a0a0a;
    border: 0;
    padding: 7px 14px;
    border-radius: 6px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    font-size: 0.85rem;
    cursor: pointer;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`;
