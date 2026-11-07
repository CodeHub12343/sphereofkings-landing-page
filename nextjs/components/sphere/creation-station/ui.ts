// Shared styled primitives for Creation Station screens.

import styled from "styled-components";

export const Card = styled.section`
  background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);
  border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px;min-width:0;
`;
export const CardHead = styled.div`
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  h3{margin:0;color:var(--gold-light,#f0c040);font-size:15px;}
`;
export const Small = styled.span`color:var(--text-muted,#a89880);font-size:12px;`;
export const Row = styled.div`display:flex;gap:8px;flex-wrap:wrap;`;
export const Primary = styled.button`
  background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:8px 14px;font-size:14px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);} &:disabled{opacity:.5;cursor:not-allowed;}
`;
export const Secondary = styled.button`
  background:transparent;color:var(--text,#f5f0e8);
  border:1px solid var(--border,#2a2218);border-radius:6px;padding:8px 14px;
  font-size:14px;cursor:pointer; &:disabled{opacity:.5;cursor:not-allowed;}
`;
export const Danger = styled.button`
  background:transparent;color:var(--status-urgent,#ff6b7a);
  border:1px solid var(--status-urgent,#ff6b7a);border-radius:6px;padding:8px 14px;
  font-size:14px;cursor:pointer;
`;
export const Err = styled.div`color:var(--status-urgent,#ff6b7a);font-size:13px;`;
export const Ok = styled.div`color:var(--status-online,#4fb07d);font-size:13px;`;
export const Field = styled.div`
  display:flex;flex-direction:column;gap:6px;
  label{color:var(--text-muted,#a89880);font-size:12px;}
  input,textarea,select{
    background:#000;color:var(--text,#f5f0e8);border:1px solid var(--border,#2a2218);
    border-radius:6px;padding:8px 10px;font-size:13px;font-family:inherit;width:100%;
  }
`;
export const Grid3 = styled.div`display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;`;
export const Grid2 = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:12px;`;
