"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { LOCALE_LABELS, SUPPORTED_LOCALES, Locale } from "@/lib/i18n";

export default function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = async (locale: Locale) => {
    await fetch("/api/locale", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    start(() => router.refresh());
  };
  return (
    <Wrap>
      <Sel value={current} onChange={(e) => set(e.target.value as Locale)} disabled={pending}>
        {SUPPORTED_LOCALES.map((l) => (
          <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
        ))}
      </Sel>
    </Wrap>
  );
}

const Wrap = styled.div`display:inline-flex;`;
const Sel = styled.select`
  background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
  border:1px solid var(--border,#2a2218);border-radius:5px;
  padding:4px 8px;font-size:12px;
`;
