"use client";

import styled, { css } from "styled-components";

export const Wrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 72px);

  @media (max-width: 720px) {
    padding: 0 20px;
  }
`;

export const GoldTitle = styled.h2`
  font-family: 'Cinzel', Georgia, serif;
  background: linear-gradient(90deg, #c9a227 0%, #f0c040 33%, #c9a227 66%, #f0c040 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const SectionEyebrow = styled.p`
  text-align: center;
  color: #c9a227;
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0 0 10px;
`;

export const btnGoldCss = css`
  display: inline-block;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  background-size: 200% auto;
  color: #0a0a0a !important;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: background-position 0.3s, box-shadow 0.3s;
  -webkit-text-fill-color: #0a0a0a;

  &:hover {
    background-position: right center;
    box-shadow: 0 0 28px rgba(240, 192, 64, 0.35);
  }
  &:focus-visible {
    outline: 3px solid #f0c040;
    outline-offset: 3px;
  }

  @media (max-width: 420px) {
    padding: 13px 20px;
    font-size: 0.92rem;
    letter-spacing: 0.06em;
  }
`;

export const BtnGold = styled.button`
  ${btnGoldCss}
`;

export const BtnGoldLink = styled.a`
  ${btnGoldCss}
`;

export const Input = styled.input<{ $error?: boolean }>`
  background: #1a1612;
  border: 1.5px solid ${(p) => (p.$error ? "#b91c1c" : "#2e2618")};
  border-radius: 6px;
  color: #f5f0e8;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  padding: 13px 16px;
  width: 100%;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #c9a227;
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.12);
  }
  &::placeholder {
    color: #5a4a38;
  }
`;

export const Textarea = styled.textarea`
  background: #1a1612;
  border: 1.5px solid #2e2618;
  border-radius: 6px;
  color: #f5f0e8;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  padding: 13px 16px;
  width: 100%;
  min-height: 140px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #c9a227;
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.12);
  }
  &::placeholder {
    color: #5a4a38;
  }
`;

export const SUBSCRIBED_EVENT = "sok:subscribed";
