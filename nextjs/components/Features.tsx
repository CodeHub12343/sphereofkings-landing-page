"use client";

import styled from "styled-components";
import { Wrap, GoldTitle, SectionEyebrow } from "./shared";

const Section = styled.section`
  padding: var(--section-pad) 0;
  background: var(--bg);
`;

const Heading = styled(GoldTitle)`
  text-align: center;
  font-size: clamp(1.7rem, 3.5vw, 2.7rem);
  margin: 0 0 52px;
  font-weight: 900;
  letter-spacing: -0.01em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 28px 24px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #4a3c1e;
    box-shadow: 0 4px 24px rgba(201, 162, 39, 0.06);
  }

  h3 {
    font-family: 'Cinzel', serif;
    color: #f5f0e8;
    font-size: 1rem;
    margin: 0 0 10px;
    font-weight: 700;
  }
  p {
    color: #a89880;
    font-size: 0.92rem;
    line-height: 1.65;
    margin: 0;
  }
`;

const IconCircle = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #1a1405, #2e2410);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
`;

type Feature = {
  title: string;
  body: string;
  svg: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "360° Gameplay",
    body: "Experience strategy from every direction on a revolutionary spherical board.",
    svg: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </>
    ),
  },
  {
    title: "Customizable Boards",
    body: "Paint and personalize your board to create a one-of-a-kind game set.",
    svg: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </>
    ),
  },
  {
    title: "Family-Friendly Fun",
    body: "Simple rules make it easy to learn, yet deep strategy keeps every match exciting.",
    svg: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    title: "Collector Quality",
    body: "Designed with premium materials and craftsmanship for lasting enjoyment.",
    svg: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
];

export default function Features() {
  return (
    <Section id="different">
      <Wrap>
        <SectionEyebrow>Experience strategy like never before</SectionEyebrow>
        <Heading>Why Sphere of Kings Is Different</Heading>
        <Grid>
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <IconCircle aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c9a227"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {f.svg}
                </svg>
              </IconCircle>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </Card>
          ))}
        </Grid>
      </Wrap>
    </Section>
  );
}
