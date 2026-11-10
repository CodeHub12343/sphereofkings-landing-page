"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import styled from "styled-components";
import type { TradingPartner, EdiTransport } from "@/lib/edi/types";
import {
  createPartnerAction,
  deletePartnerAction,
  updatePartnerAction,
} from "@/app/admin/edi/partners/actions";

const Wrap = styled.div`
  padding: 32px 24px 80px;
  color: #f5f0e8;
`;
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;
const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-size: 1.6rem;
  margin: 0 0 4px;
  color: #f0c040;
`;
const Lede = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #a89880;
  margin: 0;
  max-width: 68ch;
`;
const BackLink = styled(Link)`
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #a89880;
  text-decoration: none;
  padding: 8px 14px;
  border: 1px solid #2e2618;
  border-radius: 6px;
  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;
const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #2e2618;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;
const CardTitle = styled.h2`
  font-family: "Cinzel", serif;
  font-size: 1.05rem;
  color: #f0c040;
  margin: 0 0 14px;
`;
const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  align-items: end;
`;
const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  color: #a89880;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
`;
const Input = styled.input`
  padding: 10px 12px;
  background: #0a0a0a;
  border: 1px solid #2e2618;
  border-radius: 6px;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  &:focus {
    outline: none;
    border-color: #c9a227;
  }
`;
const Select = styled.select`
  padding: 10px 12px;
  background: #0a0a0a;
  border: 1px solid #2e2618;
  border-radius: 6px;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
`;
const Btn = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 10px 14px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid
    ${(p) => (p.$danger ? "#c62b44" : p.$primary ? "#c9a227" : "#2e2618")};
  background: ${(p) =>
    p.$primary
      ? "linear-gradient(135deg, #c9a227, #f0c040)"
      : "transparent"};
  color: ${(p) =>
    p.$primary ? "#0a0a0a" : p.$danger ? "#ff6b7a" : "#f5f0e8"};
  &:hover:not(:disabled) {
    opacity: 0.88;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  th {
    text-align: left;
    padding: 10px 12px;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #a89880;
    border-bottom: 1px solid #2e2618;
    font-weight: 700;
  }
  td {
    padding: 12px;
    border-bottom: 1px solid #1a1510;
  }
`;
const Transport = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(99, 179, 237, 0.14);
  color: #63b3ed;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
`;
const ActiveDot = styled.span<{ $on: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => (p.$on ? "#48bb78" : "#6c6155")};
  margin-right: 6px;
`;
const Toast = styled.div<{ $kind: "ok" | "err" }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 18px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  z-index: 50;
  background: ${(p) =>
    p.$kind === "ok" ? "rgba(72,187,120,0.14)" : "rgba(198,43,68,0.14)"};
  color: ${(p) => (p.$kind === "ok" ? "#48bb78" : "#ff6b7a")};
  border: 1px solid ${(p) => (p.$kind === "ok" ? "#48bb78" : "#c62b44")};
`;
const Empty = styled.div`
  padding: 30px;
  text-align: center;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
`;

export default function TradingPartnersAdmin({
  partners,
}: {
  partners: TradingPartner[];
}) {
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [providerPartnerId, setProviderPartnerId] = useState("");
  const [transport, setTransport] = useState<EdiTransport>("API");
  const [gln, setGln] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(
    null,
  );
  const notify = (kind: "ok" | "err", msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return notify("err", "Name required.");
    start(async () => {
      const r = await createPartnerAction({
        name,
        providerPartnerId: providerPartnerId || undefined,
        transport,
        gln: gln || undefined,
        warehouseLocation: warehouseLocation || undefined,
      });
      if (r.ok) {
        notify("ok", `Added ${name}`);
        setName("");
        setProviderPartnerId("");
        setGln("");
        setWarehouseLocation("");
      } else notify("err", r.error);
    });
  };

  const toggleActive = (p: TradingPartner) => {
    start(async () => {
      const r = await updatePartnerAction(p.id, { active: !p.active });
      if (r.ok) notify("ok", `${p.name} ${p.active ? "deactivated" : "activated"}`);
      else notify("err", r.error);
    });
  };

  const remove = (p: TradingPartner) => {
    if (!confirm(`Delete trading partner ${p.name}? This cannot be undone.`))
      return;
    start(async () => {
      const r = await deletePartnerAction(p.id);
      if (r.ok) notify("ok", `Deleted ${p.name}`);
      else notify("err", r.error);
    });
  };

  return (
    <Wrap>
      <HeaderRow>
        <div>
          <Title>Trading partners</Title>
          <Lede>
            Retailers, wholesalers, and distributors we exchange EDI documents
            with. Each row holds the transport (API, AS2, SFTP, VAN), the
            provider-side partner ID, and the retailer&apos;s GLN where
            applicable.
          </Lede>
        </div>
        <BackLink href="/admin/edi">← Back to EDI operations</BackLink>
      </HeaderRow>

      <Card>
        <CardTitle>Add trading partner</CardTitle>
        <Form onSubmit={submit}>
          <Field>
            Retailer name
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Target"
            />
          </Field>
          <Field>
            Provider partner ID
            <Input
              value={providerPartnerId}
              onChange={(e) => setProviderPartnerId(e.target.value)}
              placeholder="tgt-dc-3808"
            />
          </Field>
          <Field>
            Transport
            <Select
              value={transport}
              onChange={(e) => setTransport(e.target.value as EdiTransport)}
            >
              <option value="API">API</option>
              <option value="AS2">AS2</option>
              <option value="SFTP">SFTP</option>
              <option value="VAN">VAN</option>
            </Select>
          </Field>
          <Field>
            GLN (optional)
            <Input
              value={gln}
              onChange={(e) => setGln(e.target.value)}
              placeholder="0012345678905"
            />
          </Field>
          <Field>
            Warehouse / DC
            <Input
              value={warehouseLocation}
              onChange={(e) => setWarehouseLocation(e.target.value)}
              placeholder="DC 3808 · Shafter, CA"
            />
          </Field>
          <Btn $primary type="submit" disabled={pending}>
            {pending ? "Saving…" : "Add partner"}
          </Btn>
        </Form>
      </Card>

      <Card>
        <CardTitle>All partners ({partners.length})</CardTitle>
        {partners.length === 0 ? (
          <Empty>
            No trading partners yet. Add one above to start receiving POs from
            that retailer.
          </Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Retailer</th>
                <th>Transport</th>
                <th>Provider ID</th>
                <th>GLN</th>
                <th>Warehouse</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id}>
                  <td>
                    <ActiveDot $on={p.active} />
                    {p.name}
                  </td>
                  <td>
                    <Transport>{p.transport}</Transport>
                  </td>
                  <td
                    style={{
                      fontFamily: "Menlo, Consolas, monospace",
                      fontSize: "0.78rem",
                      color: "#c9a227",
                    }}
                  >
                    {p.providerPartnerId || "—"}
                  </td>
                  <td
                    style={{
                      fontFamily: "Menlo, Consolas, monospace",
                      fontSize: "0.78rem",
                      color: "#a89880",
                    }}
                  >
                    {p.gln || "—"}
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "#a89880" }}>
                    {p.warehouseLocation || "—"}
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "#a89880" }}>
                    {new Date(p.createdISO).toLocaleDateString()}
                  </td>
                  <td>
                    <Btn
                      onClick={() => toggleActive(p)}
                      disabled={pending}
                      style={{ marginRight: 6, padding: "6px 10px", fontSize: "0.72rem" }}
                    >
                      {p.active ? "Deactivate" : "Activate"}
                    </Btn>
                    <Btn
                      $danger
                      onClick={() => remove(p)}
                      disabled={pending}
                      style={{ padding: "6px 10px", fontSize: "0.72rem" }}
                    >
                      Delete
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {toast && <Toast $kind={toast.kind}>{toast.msg}</Toast>}
    </Wrap>
  );
}
