"use client";

import styled from "styled-components";
import { Wrap } from "@/components/shared";
import EmailPreview from "@/components/admin/EmailPreview";

const Page = styled.section`
  padding: clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px);
`;

const Head = styled.header`
  margin-bottom: 20px;

  h1 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: clamp(1.6rem, 3vw, 2.1rem);
    margin: 0 0 6px;
    font-weight: 800;
  }
  p {
    font-family: "Inter", sans-serif;
    color: #a89880;
    font-size: 0.92rem;
    margin: 0;
    line-height: 1.55;
    max-width: 720px;
  }
  code {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    color: #f0c040;
    background: #1a1612;
    padding: 1px 7px;
    border-radius: 3px;
    font-size: 0.86em;
  }
`;

export default function AdminEmailsPage() {
  return (
    <Page>
      <Wrap>
        <Head>
          <h1>Email templates</h1>
          <p>
            Four templates ready to pass to your email provider: launch
            announcement, order confirmation, dispatch notice, affiliate
            payout statement. Table-based with inline styles so Outlook,
            Gmail, Apple Mail and Yahoo all render them the same. Use{" "}
            <code>renderToStaticMarkup</code> (or React Email) on the
            server to produce the HTML the provider sends.
          </p>
        </Head>
        <EmailPreview />
      </Wrap>
    </Page>
  );
}
