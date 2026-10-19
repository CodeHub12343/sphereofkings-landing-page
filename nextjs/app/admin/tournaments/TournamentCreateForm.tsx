"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { createTournamentAction } from "./actions";

export default function TournamentCreateForm() {
  const [state, formAction, pending] = useActionState(
    createTournamentAction, {} as { error?: string; ok?: boolean; slug?: string },
  );
  const router = useRouter();
  if (state?.ok && state.slug) {
    setTimeout(() => router.push(`/tournaments/${state.slug}`), 300);
  }
  return (
    <Form action={formAction}>
      <Row>
        <Field>
          <label>Name</label>
          <input name="name" required maxLength={80} />
        </Field>
        <Field>
          <label>Slug</label>
          <input name="slug" required pattern="^[a-z0-9-]{3,60}$" placeholder="e.g. autumn-cup-2026" />
        </Field>
      </Row>
      <Row>
        <Field>
          <label>Game</label>
          <select name="game" defaultValue="royal-checkers">
            <option value="royal-checkers">Royal Checkers</option>
            <option value="imperial-kings">Imperial Kings</option>
          </select>
        </Field>
        <Field>
          <label>Size</label>
          <select name="size" defaultValue="16">
            <option>4</option><option>8</option><option>16</option><option>32</option>
          </select>
        </Field>
        <Field>
          <label>Region</label>
          <select name="region" defaultValue="global">
            <option value="global">Global</option>
            <option value="na">North America</option>
            <option value="sa">South America</option>
            <option value="eu">Europe</option>
            <option value="africa">Africa</option>
            <option value="asia">Asia</option>
            <option value="oceania">Oceania</option>
          </select>
        </Field>
      </Row>
      <Row>
        <Field>
          <label>Registration opens</label>
          <input name="registrationOpensAt" type="datetime-local" required />
        </Field>
        <Field>
          <label>Registration closes</label>
          <input name="registrationClosesAt" type="datetime-local" required />
        </Field>
        <Field>
          <label>Starts</label>
          <input name="startsAt" type="datetime-local" required />
        </Field>
      </Row>
      <Field>
        <label>Description (optional)</label>
        <textarea name="description" rows={3} maxLength={2000} />
      </Field>
      {state?.error && <Err>{state.error}</Err>}
      {state?.ok && <Ok>Created — opening tournament…</Ok>}
      <Submit disabled={pending}>{pending ? "Creating…" : "Create"}</Submit>
    </Form>
  );
}

const Form = styled.form`
  display:flex;flex-direction:column;gap:12px;
  padding:16px;background:var(--bg2,#0d0b08);
  border:1px solid var(--border,#2a2218);border-radius:8px;max-width:720px;
`;
const Row = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;`;
const Field = styled.div`
  display:flex;flex-direction:column;gap:4px;
  label{font-size:12px;color:var(--text-muted,#a89880);text-transform:uppercase;letter-spacing:.05em;}
  input,select,textarea{
    background:var(--bg3,#111009);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:5px;padding:7px 9px;font-size:13px;font-family:inherit;
  }
`;
const Submit = styled.button`
  align-self:flex-start;background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:9px 14px;font-size:14px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);} &:disabled{opacity:.6;}
`;
const Err = styled.div`
  padding:8px;border-radius:5px;color:var(--status-urgent,#ff6b7a);
  background:rgba(255,107,122,.08);border:1px solid var(--status-urgent,#ff6b7a);font-size:13px;
`;
const Ok = styled.div`
  padding:8px;border-radius:5px;color:var(--status-online,#4fb07d);
  background:rgba(79,176,125,.08);border:1px solid var(--status-online,#4fb07d);font-size:13px;
`;
