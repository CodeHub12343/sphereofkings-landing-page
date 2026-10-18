"use client";

import styled from "styled-components";

const Bar = styled.div`
  background: rgba(224, 169, 74, 0.08);
  border: 1px solid #e0a94a;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #e0a94a;
  display: flex;
  gap: 10px;
  align-items: center;
  line-height: 1.4;
  margin-bottom: 20px;

  svg {
    flex-shrink: 0;
  }
  strong {
    color: #f5f0e8;
  }
`;

type Props = {
  // When set, replaces the default "sample rows shown" copy with a
  // page-specific message. Pages whose backing collection has no demo
  // fallback (subscribers, quotes, expenses) should supply their own
  // wording so the note doesn't lie about "seeded demo records".
  title?: string;
  message?: React.ReactNode;
};

/**
 * Rendered only when a page's backing collection is still empty. The
 * caller passes nothing here when real rows exist. The default copy
 * speaks to pages that fall back to seeded demos (orders, affiliates,
 * products). Other pages can override `title` + `message` to tell the
 * truth about THEIR empty state.
 */
export default function DemoBanner({ title, message }: Props = {}) {
  return (
    <Bar role="note">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M8 4.5v4m0 2v.3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span>
        <strong>{title ?? "Sample rows shown."}</strong>{" "}
        {message ?? (
          <>
            The backing collection is empty, so this view falls back to seeded
            demo records. Real activity (orders, quotes, applications,
            expenses) replaces them automatically as it arrives.
          </>
        )}
      </span>
    </Bar>
  );
}
