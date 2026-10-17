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
          </Legal>
        </Bottom>
      </Wrap>
    </FooterEl>
  );
}
