"use client";

import { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import ReportButton from "@/components/ReportButton";

interface Comment {
  id: string;
  authorUsername: string;
  authorDisplayName: string;
  body: string;
  createdAt: string;
  moderationStatus?: "clean" | "flagged" | "blocked";
}

interface Props {
  slug: string;
  initialComments: Comment[];
  signedIn: boolean;
  isMinor?: boolean;
}

export default function CommentsSection({ slug, initialComments, signedIn, isMinor }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!body.trim()) return;
    setSending(true); setError(null);
    try {
      const r = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Could not post."); return; }
      setComments((prev) => [...prev, data.comment]);
      setBody("");
    } finally { setSending(false); }
  };

  return (
    <section>
      <h2 style={{ color: "var(--gold-light,#f0c040)", fontSize: 18, margin: "0 0 16px" }}>
        Comments ({comments.length})
      </h2>

      {!signedIn ? (
        <Panel>
          <Link href={`/signin?next=/blog/${slug}`} style={{ color: "var(--gold-light,#f0c040)" }}>
            Sign in
          </Link> to comment.
        </Panel>
      ) : isMinor ? (
        <Panel>
          Comments are paused on your account until a parent completes consent.{" "}
          <Link href="/me/consent" style={{ color: "var(--gold-light,#f0c040)" }}>
            Request consent
          </Link>.
        </Panel>
      ) : (
        <Composer>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3}
                    maxLength={2000} placeholder="Share your thoughts…" />
          {error && <Err>{error}</Err>}
          <Row>
            <Primary onClick={send} disabled={sending || !body.trim()}>
              {sending ? "Posting…" : "Post comment"}
            </Primary>
          </Row>
        </Composer>
      )}

      <List>
        {comments.length === 0 ? (
          <Empty>No comments yet.</Empty>
        ) : comments.map((c) => (
          <li key={c.id}>
            <Head>
              <Link href={`/u/${c.authorUsername}`} style={{ color: "var(--text,#f5f0e8)", textDecoration: "none" }}>
                <strong>{c.authorDisplayName}</strong>
              </Link>
              <Time>{new Date(c.createdAt).toLocaleString()}</Time>
              {c.moderationStatus === "flagged" && <Flag>flagged</Flag>}
            </Head>
            <Body>{c.body}</Body>
            <Footer>
              <ReportButton subjectKind="message" subjectId={c.id} label="Report" />
            </Footer>
          </li>
        ))}
      </List>
    </section>
  );
}

const Panel = styled.div`
  padding:14px;background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);
  border-radius:8px;color:var(--text,#f5f0e8);font-size:14px;margin-bottom:20px;
`;
const Composer = styled.div`
  display:flex;flex-direction:column;gap:8px;margin-bottom:28px;
  textarea{background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:8px;padding:10px 12px;
    font-size:14px;font-family:inherit;resize:vertical;}
`;
const Row = styled.div`display:flex;gap:10px;justify-content:flex-end;`;
const Primary = styled.button`
  background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:8px 14px;font-size:14px;font-weight:600;cursor:pointer;
  &:disabled{opacity:.6;}
`;
const Err = styled.div`color:var(--status-urgent,#ff6b7a);font-size:12px;`;
const List = styled.ul`
  list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px;
  li{padding:14px;background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);
    border-radius:8px;color:var(--text,#f5f0e8);}
`;
const Head = styled.div`display:flex;gap:10px;align-items:baseline;margin-bottom:6px;flex-wrap:wrap;`;
const Time = styled.span`font-size:12px;color:var(--text-muted,#a89880);`;
const Flag = styled.span`font-size:11px;color:var(--status-waiting,#e0a94a);
  padding:1px 6px;border-radius:3px;background:rgba(224,169,74,.1);`;
const Body = styled.p`margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word;`;
const Footer = styled.div`margin-top:8px;`;
const Empty = styled.div`color:var(--text-muted,#a89880);padding:20px;text-align:center;`;
