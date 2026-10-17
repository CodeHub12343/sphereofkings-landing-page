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

/**
 * The admin area is not yet auth-gated and uses sample records so the UI can
 * be reviewed and iterated on. We flag that honestly at the top of each
 * admin page so no operator confuses this with the real console.
 */
export default function DemoBanner() {
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
        <strong>Demo data.</strong> Access is gated by a single HTTP Basic
        password (<code style={{ fontFamily: "monospace" }}>ADMIN_USER</code> /{" "}
        <code style={{ fontFamily: "monospace" }}>ADMIN_PASSWORD</code>). Rows
        below are sample records — connect a real data source and a proper
        auth system before onboarding more operators.
      </span>
    </Bar>
  );
}
