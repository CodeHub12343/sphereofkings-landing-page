"use client";

import { useActionState } from "react";
import styled from "styled-components";
import { upsertPostAction } from "./actions";

export default function PostEditor() {
  const [state, formAction, pending] = useActionState(
    upsertPostAction, {} as { error?: string; ok?: boolean; slug?: string },
  );
  return (
    <Form action={formAction}>
      <Row>
        <Field><label>Slug</label><input name="slug" required pattern="^[a-z0-9-]{3,80}$" placeholder="my-post-slug" /></Field>
        <Field><label>Status</label>
          <select name="status" defaultValue="draft">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
      </Row>
      <Field><label>Title</label><input name="title" required maxLength={200} /></Field>
      <Field><label>Excerpt</label><input name="excerpt" required maxLength={300} /></Field>
      <Field><label>Hero image URL (optional)</label><input name="heroImageUrl" maxLength={500} /></Field>
      <Field><label>Vlog embed URL (YouTube / Vimeo, optional)</label><input name="vlogEmbedUrl" maxLength={500} /></Field>
      <Field><label>Tags (comma-separated)</label><input name="tags" maxLength={200} placeholder="announcement, geometry" /></Field>
      <Field><label>Body (Markdown)</label><textarea name="bodyMarkdown" required rows={14} /></Field>
      {state?.error && <Err>{state.error}</Err>}
      {state?.ok && <Ok>Saved: {state.slug}</Ok>}
      <Submit disabled={pending}>{pending ? "Saving…" : "Save post"}</Submit>
    </Form>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:12px;max-width:720px;
  padding:16px;background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);border-radius:8px;`;
const Row = styled.div`display:grid;grid-template-columns:1fr 160px;gap:10px;`;
const Field = styled.div`
  display:flex;flex-direction:column;gap:4px;
  label{font-size:12px;color:var(--text-muted,#a89880);text-transform:uppercase;letter-spacing:.05em;}
  input,select,textarea{background:var(--bg3,#111009);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:5px;padding:7px 9px;font-size:13px;font-family:inherit;}
  textarea{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
`;
const Submit = styled.button`
  align-self:flex-start;background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:9px 14px;font-size:14px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);} &:disabled{opacity:.6;}
`;
const Err = styled.div`padding:8px;color:var(--status-urgent,#ff6b7a);
  background:rgba(255,107,122,.08);border:1px solid var(--status-urgent,#ff6b7a);border-radius:5px;font-size:13px;`;
const Ok = styled.div`padding:8px;color:var(--status-online,#4fb07d);
  background:rgba(79,176,125,.08);border:1px solid var(--status-online,#4fb07d);border-radius:5px;font-size:13px;`;
