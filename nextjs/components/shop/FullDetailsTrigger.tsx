"use client";

import { useState } from "react";
import styled from "styled-components";
import FullDetailsModal from "./FullDetailsModal";

interface Props { title: string; bodyMarkdown: string; }

/**
 * Thin wrapper so the server-rendered ProductDetail can drop in a
 * client interactive button without becoming a client component.
 */
export default function FullDetailsTrigger({ title, bodyMarkdown }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Trigger type="button" onClick={() => setOpen(true)}>
        Read full description
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7" />
          <path d="M9 7h8v8" />
        </svg>
      </Trigger>
      <FullDetailsModal open={open} onClose={() => setOpen(false)}
                        title={title} bodyMarkdown={bodyMarkdown} />
    </>
  );
}

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 20px;
  padding: 10px 16px;
  background: transparent;
  color: var(--gold-light, #f0c040);
  border: 1px solid var(--gold, #c9a227);
  border-radius: 6px;
  font-family: "Cinzel", Georgia, serif;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.25s, box-shadow 0.25s, color 0.25s;

  &:hover {
    background: rgba(201, 162, 39, 0.08);
    box-shadow: 0 0 20px rgba(201, 162, 39, 0.12);
    color: var(--gold-light, #f0c040);
  }
  &:focus-visible { outline: 3px solid var(--gold-light, #f0c040); outline-offset: 2px; }

  svg { opacity: 0.8; transition: transform 0.25s; }
  &:hover svg { transform: translate(2px, -2px); }
`;
