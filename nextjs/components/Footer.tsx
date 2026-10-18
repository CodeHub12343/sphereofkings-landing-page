"use client";

import styled from "styled-components";
import { Wrap } from "./shared";

const FooterEl = styled.footer`
  background: #0a0806;
  border-top: 1px solid #1e1a12;
  padding: 56px 0 28px;
  color: #a89880;
`;

const Cols = styled.div`
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 40px;
`;

const Brand = styled.div`
  flex: 1 1 240px;
  min-width: 0;

  img {
    height: 42px;
    object-fit: contain;
    margin-bottom: 16px;
    display: block;
  }
`;

const Tagline = styled.p`
  color: #c8b898;
  font-size: 0.92rem;
  line-height: 1.65;
  margin: 0 0 10px;
  max-width: 280px;
`;

const SalesNote = styled.p`
  color: #8a7a60;
  font-size: 0.82rem;
  font-style: italic;
  margin: 0;
`;

const Col = styled.div`
  flex: 0 1 160px;
`;

const Heading = styled.h4`
  font-family: 'Cinzel', serif;
  color: #f0c040;
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin: 0 0 16px;
  font-weight: 700;
`;

const Links = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Link = styled.a`
  color: #c8b898;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.18s;

  &:hover,
  &:focus-visible {
    color: #f0c040;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #1e1a12;
  margin: 0;
`;

const Bottom = styled.div`
  padding-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: space-between;
  align-items: center;
`;

const Copy = styled.p`
  color: #8a7a60;
  font-size: 0.82rem;
  margin: 0;
`;

const Legal = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
`;

const LegalLink = styled.a`
  color: #8a7a60;
  font-size: 0.82rem;
  text-decoration: none;
  transition: color 0.18s;

  &:hover {
    color: #f0c040;
  }
`;

// Discreet "staff area" link. Points at /admin so middleware can send
// signed-in operators straight through and bounce signed-out ones to
// /admin/signin. Styled smaller + chip-like so it reads as "not for
// shoppers" without hiding it.
const StaffLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #8a7a60;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 5px 10px;
  border: 1px solid #2e2618;
  border-radius: 999px;
  transition: color 0.18s, border-color 0.18s, background 0.18s;

  &:hover,
  &:focus-visible {
    color: #f0c040;
    border-color: #c9a227;
    background: rgba(201, 162, 39, 0.06);
  }

  svg {
    opacity: 0.8;
  }
`;

export default function Footer() {
  return (
    <FooterEl>
      <Wrap>
        <Cols>
          <Brand>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/b17be116-af38-47af-9813-ffa3c2aec5e7.jpg"
              alt="Sphere of Kings 7 in 1"
              loading="lazy"
            />
            <Tagline>
              A revolutionary 360° board game. Launching on Kickstarter November 19, 2026.
            </Tagline>
            <SalesNote>Sales open after the Kickstarter campaign concludes.</SalesNote>
          </Brand>

          <Col>
            <Heading>Explore</Heading>
            <Links>
              <Link href="#story">Story</Link>
              <Link href="#different">Why It&apos;s Different</Link>
              <Link href="#showcase">7-in-1 Showcase</Link>
              <Link href="#tiers">Pledge Tiers</Link>
              <Link href="#video">Video</Link>
              <Link href="#contact">Contact</Link>
            </Links>
          </Col>

          <Col>
            <Heading>Connect</Heading>
            <Links>
              <Link href="#" aria-label="Follow Sphere of Kings on Instagram">
                Instagram
              </Link>
              <Link href="#" aria-label="Follow Sphere of Kings on Facebook">
                Facebook
              </Link>
              <Link href="#" aria-label="Follow Sphere of Kings on TikTok">
                TikTok
              </Link>
              <Link href="mailto:hello@sphereofkings.com">hello@sphereofkings.com</Link>
            </Links>
          </Col>
        </Cols>

        <Divider />
        <Bottom>
          <Copy>© 2026 Sphere of Kings. All rights reserved. Sphere of Kings 7-in-1™</Copy>
          <Legal>
            <LegalLink href="#">Privacy Policy</LegalLink>
            <LegalLink href="#">Terms of Service</LegalLink>
            <StaffLink
              href="/admin"
              aria-label="Staff sign-in — admin console"
              title="Staff only · sign in to the admin console"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="5.5"
                  width="6"
                  height="5"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M4.5 5.5V3.75a1.5 1.5 0 0 1 3 0V5.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
              Staff
            </StaffLink>
          </Legal>
        </Bottom>
      </Wrap>
    </FooterEl>
  );
}
