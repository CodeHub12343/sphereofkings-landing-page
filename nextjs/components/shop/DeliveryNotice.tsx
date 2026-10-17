"use client";

import styled from "styled-components";

export type DeliveryNoticeVariant = "early-bird" | "kickstarter";

const Notice = styled.aside<{ $variant: DeliveryNoticeVariant }>`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid
    ${(p) => (p.$variant === "early-bird" ? "#c9a227" : "#3b5bc9")};
  background: ${(p) =>
    p.$variant === "early-bird"
      ? "rgba(201, 162, 39, 0.08)"
      : "rgba(59, 91, 201, 0.08)"};
`;

const Ico = styled.span<{ $variant: DeliveryNoticeVariant }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: #0a0a0a;
  background: ${(p) =>
    p.$variant === "early-bird" ? "#c9a227" : "#3b5bc9"};
`;

const Body = styled.div`
  flex: 1;
`;

const Eye = styled.div<{ $variant: DeliveryNoticeVariant }>`
  font-family: "Cinzel", serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${(p) => (p.$variant === "early-bird" ? "#c9a227" : "#7fa3ff")};
  margin-bottom: 4px;
`;

const Title = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #f5f0e8;
  margin: 0 0 6px;
`;

const Line = styled.p`
  font-size: 0.92rem;
  line-height: 1.5;
  color: #f5f0e8;
  margin: 0 0 6px;
  font-weight: 500;
`;

const Fine = styled.p`
  font-size: 0.8rem;
  line-height: 1.5;
  color: #a89880;
  margin: 0;
`;

/**
 * The two approved delivery messages. Wording is fixed by brand rules;
 * callers choose a variant, not the copy.
 */
export default function DeliveryNotice({
  variant,
}: {
  variant: DeliveryNoticeVariant;
}) {
  if (variant === "early-bird") {
    return (
      <Notice $variant="early-bird" role="note">
        <Ico $variant="early-bird" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 2 10.9 6.1 15 7l-3 3 .7 4.3L9 12l-3.7 2.3L6 10l-3-3 4.1-.9L9 2Z"
              fill="currentColor"
            />
          </svg>
        </Ico>
        <Body>
          <Eye $variant="early-bird">Christmas Early Bird Special</Eye>
          <Title>Deliveries start December 1, 2026</Title>
          <Line>
            Order from the shop to join the first families playing on Christmas
            morning.
          </Line>
          <Fine>
            We ship in the sequence orders are paid. Not every parcel will arrive
            on December 1.
          </Fine>
        </Body>
      </Notice>
    );
  }
  return (
    <Notice $variant="kickstarter" role="note">
      <Ico $variant="kickstarter" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect
            x="2"
            y="4"
            width="14"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M6 8h6M6 11h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </Ico>
      <Body>
        <Eye $variant="kickstarter">Kickstarter pledges</Eye>
        <Title>Deliveries expected mid-December 2026</Title>
        <Line>
          Backers of the Kickstarter campaign (launching November 19, 2026) ship
          on a separate schedule.
        </Line>
        <Fine>
          This timeline is an expectation, not a guarantee. Delays will be
          communicated by email.
        </Fine>
      </Body>
    </Notice>
  );
}
