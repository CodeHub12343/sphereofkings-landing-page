"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import LaunchAnnouncement from "@/components/emails/LaunchAnnouncement";
import OrderConfirmationEmail from "@/components/emails/OrderConfirmationEmail";
import DispatchNotice from "@/components/emails/DispatchNotice";
import AffiliatePayoutStatement from "@/components/emails/AffiliatePayoutStatement";
import { sendTestEmailAction } from "@/app/admin/emails/actions";

type Template = "launch" | "order" | "dispatch" | "payout";

const Layout = styled.section`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Rail = styled.nav`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const RailHead = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a89880;
  padding: 10px 12px 6px;
`;

const RailBtn = styled.button<{ $on: boolean }>`
  background: ${(p) => (p.$on ? "#1a1612" : "transparent")};
  border: 0;
  border-radius: 8px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  color: ${(p) => (p.$on ? "#f0c040" : "#f5f0e8")};
  font-family: inherit;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &:hover {
    background: #140f0a;
  }

  .n {
    font-family: "Cinzel", serif;
    font-size: 0.92rem;
    font-weight: 700;
  }
  .d {
    font-family: "Inter", sans-serif;
    font-size: 0.72rem;
    color: #a89880;
    line-height: 1.4;
  }
`;

const Pane = styled.article`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Head = styled.header`
  padding: 14px 20px;
  border-bottom: 1px solid #1e1a12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1rem;
    margin: 0;
    font-weight: 700;
  }
  .sub {
    font-family: "Inter", sans-serif;
    font-size: 0.78rem;
    color: #a89880;
  }
`;

const Tools = styled.div`
  display: flex;
  gap: 8px;
`;

const Btn = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const Frame = styled.iframe`
  width: 100%;
  min-height: 820px;
  border: 0;
  background: #0a0a0a;
`;

const TEMPLATES: Record<
  Template,
  { title: string; subtitle: string; subject: string }
> = {
  launch: {
    title: "Launch announcement",
    subtitle: "Sent once · to Consented subscribers",
    subject: "Christmas Early Bird preorders are open — Sphere of Kings",
  },
  order: {
    title: "Order confirmation",
    subtitle: "Transactional · after Stripe confirms the charge",
    subject: "Order confirmed · Sphere of Kings",
  },
  dispatch: {
    title: "Dispatch notice",
    subtitle: "Transactional · when fulfillment marks Dispatched",
    subject: "Your Sphere is on its way · Sphere of Kings",
  },
  payout: {
    title: "Affiliate payout statement",
    subtitle: "Monthly · to active affiliates",
    subject: "Your September earnings · Sphere of Kings affiliate",
  },
};

function renderHtml(template: Template): string {
  const el = (() => {
    switch (template) {
      case "launch":
        return <LaunchAnnouncement firstName="Marion" />;
      case "order":
        return (
          <OrderConfirmationEmail
            firstName="Marion"
            orderRef="SOK-004218"
            lines={[
              { name: "Complete 7-in-1", qty: 1, totalDisplay: "$—" },
              {
                name: "Royal Checkers refill",
                qty: 2,
                totalDisplay: "$—",
              },
            ]}
            subtotalDisplay="$—"
            shippingDisplay="$—"
            taxDisplay="$—"
            totalDisplay="$—"
            shipTo={"Marion Clarke\n12 Grove Lane, Flat 3\nLondon SW1A 1AA\nUnited Kingdom"}
            affiliateCode="POSTER-247"
          />
        );
      case "dispatch":
        return (
          <DispatchNotice
            firstName="Marion"
            orderRef="SOK-004218"
            carrier="DHL Express"
            trackingNumber="1Z999AA10123456784"
            trackingUrl="https://www.dhl.com/track"
            itemsSummary="1 × Complete 7-in-1 and 2 × Royal Checkers refill"
            shipTo={"Marion Clarke\n12 Grove Lane, Flat 3\nLondon SW1A 1AA\nUnited Kingdom"}
          />
        );
      case "payout":
        return (
          <AffiliatePayoutStatement
            firstName="Benjamin"
            code="POSTER-247"
            periodLabel="September 2026"
            tierName="Gold"
            tierRate={15}
            approvedCount={176}
            payoutDisplay="$—"
            payoutMethod="Bank transfer · pending once prices are approved"
            lines={[
              {
                dateDisplay: "Sep 28",
                orderRef: "SOK-004218",
                type: "approved",
                commissionDisplay: "$—",
              },
              {
                dateDisplay: "Sep 27",
                orderRef: "SOK-004210",
                type: "approved",
                commissionDisplay: "$—",
              },
              {
                dateDisplay: "Sep 24",
                orderRef: "SOK-004193",
                type: "refunded",
                commissionDisplay: "− $—",
              },
              {
                dateDisplay: "Sep 22",
                orderRef: "SOK-004177",
                type: "cancelled",
                commissionDisplay: "$—",
              },
            ]}
          />
        );
    }
  })();
  return "<!doctype html>" + renderToStaticMarkup(el);
}

export default function EmailPreview() {
  const [template, setTemplate] = useState<Template>("launch");
  const html = useMemo(() => renderHtml(template), [template]);
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const [testTo, setTestTo] = useState("");
  const [testStatus, setTestStatus] = useState<
    | { kind: "idle" }
    | { kind: "ok"; to: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [, startTransition] = useTransition();

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
    } catch {
      // best-effort
    }
  };

  const download = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    if (linkRef.current) {
      linkRef.current.href = url;
      linkRef.current.download = `${template}.html`;
      linkRef.current.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const sendTest = () => {
    const to = testTo.trim();
    if (!/.+@.+\..+/.test(to)) {
      setTestStatus({ kind: "error", message: "Enter a valid email first." });
      return;
    }
    setTestStatus({ kind: "idle" });
    startTransition(async () => {
      const res = await sendTestEmailAction(template, to).catch(
        () => ({ ok: false, error: "Network error" } as const),
      );
      if (res.ok) setTestStatus({ kind: "ok", to: res.to });
      else setTestStatus({ kind: "error", message: res.error });
    });
  };

  const info = TEMPLATES[template];

  return (
    <Layout>
      <Rail aria-label="Email templates">
        <RailHead>Templates</RailHead>
        {(Object.keys(TEMPLATES) as Template[]).map((t) => (
          <RailBtn
            key={t}
            type="button"
            $on={t === template}
            onClick={() => setTemplate(t)}
            aria-current={t === template ? "page" : undefined}
          >
            <span className="n">{TEMPLATES[t].title}</span>
            <span className="d">{TEMPLATES[t].subtitle}</span>
          </RailBtn>
        ))}
      </Rail>

      <Pane>
        <Head>
          <div>
            <h2>{info.title}</h2>
            <div className="sub">
              Subject · <strong style={{ color: "#f5f0e8" }}>{info.subject}</strong>
            </div>
          </div>
          <Tools>
            <Btn type="button" onClick={copyHtml}>
              Copy HTML
            </Btn>
            <Btn type="button" onClick={download}>
              Download .html
            </Btn>
            <a ref={linkRef} style={{ display: "none" }} aria-hidden="true" />
          </Tools>
        </Head>

        <TestBar>
          <TestLabel htmlFor="test-to">Send test to</TestLabel>
          <TestInput
            id="test-to"
            type="email"
            placeholder="you@yourdomain.com"
            value={testTo}
            onChange={(e) => {
              setTestTo(e.target.value);
              if (testStatus.kind !== "idle") setTestStatus({ kind: "idle" });
            }}
          />
          <TestBtn type="button" onClick={sendTest}>
            Send test
          </TestBtn>
          {testStatus.kind === "ok" && (
            <TestMsg $tone="ok">Sent to {testStatus.to}.</TestMsg>
          )}
          {testStatus.kind === "error" && (
            <TestMsg $tone="err">{testStatus.message}</TestMsg>
          )}
        </TestBar>

        <Frame
          title={`${info.title} preview`}
          srcDoc={html}
          sandbox=""
        />
      </Pane>
    </Layout>
  );
}

/* ----- send-test input strip ----- */

const TestBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-bottom: 1px solid #1e1a12;
  background: #0a0a0a;
  flex-wrap: wrap;
`;

const TestLabel = styled.label`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
`;

const TestInput = styled.input`
  flex: 1 1 220px;
  min-width: 180px;
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 6px;
  padding: 8px 12px;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;

  &:focus {
    outline: 0;
    border-color: #c9a227;
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.14);
  }
`;

const TestBtn = styled.button`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  padding: 8px 14px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 18px rgba(240, 192, 64, 0.3);
  }
`;

const TestMsg = styled.span<{ $tone: "ok" | "err" }>`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${(p) => (p.$tone === "ok" ? "#4fb07d" : "#ff6b7a")};
`;
