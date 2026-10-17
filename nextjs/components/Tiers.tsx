"use client";

import styled from "styled-components";
import { Wrap, GoldTitle, SectionEyebrow } from "./shared";

type Tier = { title: string; price: string; priceIsItalic?: boolean; body: string; img: string; alt: string };

const TIERS: Tier[] = [
  {
    title: "Kingdom Supporter",
    price: "$5",
    body: "Show your early support and be recognized as a founding backer of the Kingdom.",
    img: "/images/c298caf6-a7af-4121-9b95-3cb1f16fab72.jpg",
    alt: "Kingdom Supporter pledge tier",
  },
  {
    title: "Royal Triple Pack",
    price: "Price at launch",
    priceIsItalic: true,
    body: "3 complete 7-in-1 Sphere of Kings sets. Perfect for gifting or a family collection.",
    img: "/images/b537bf89-3632-4281-aab5-1d928a83effd.jpg",
    alt: "Royal Triple Pack — 3 complete 7-in-1 Sphere of Kings game boards",
  },
  {
    title: "Kingdom 5-Pack",
    price: "Price at launch",
    priceIsItalic: true,
    body: "5 complete sets for game clubs, classrooms, or the ultimate collector.",
    img: "/images/08c0600b-f713-4ca9-9dd7-b792d0b9a0bc.jpg",
    alt: "Kingdom 5-Pack — 5 complete Sphere of Kings game boards",
  },
  {
    title: "Grandmaster 10-Pack",
    price: "Price at launch",
    priceIsItalic: true,
    body: "10 complete sets — ideal for schools, game cafes, or bulk gift orders.",
    img: "/images/de6dcdb2-d872-4b9d-8451-b21622f9ec9e.jpg",
    alt: "Grandmaster 10-Pack — 10 complete Sphere of Kings game boards",
  },
];

const Section = styled.section`
  padding: var(--section-pad) 0;
  background: var(--bg);
`;

const Heading = styled(GoldTitle)`
  text-align: center;
  font-size: clamp(1.7rem, 3.5vw, 2.7rem);
  margin: 0 0 10px;
  font-weight: 900;
`;

const Preview = styled.p`
  text-align: center;
  color: #5a4a38;
  font-size: 0.82rem;
  margin: 0 0 44px;
  font-style: italic;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px;
`;

const Card = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #c9a227;
    box-shadow: 0 4px 32px rgba(201, 162, 39, 0.12);
  }

  img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    display: block;
  }
`;

const CardBody = styled.div`
  padding: 18px;
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;

  h3 {
    font-family: 'Cinzel', serif;
    color: #f5f0e8;
    font-size: 0.95rem;
    margin: 0;
    font-weight: 700;
  }
`;

const Price = styled.span<{ $italic?: boolean }>`
  white-space: nowrap;
  ${(p) =>
    p.$italic
      ? `color: #5a4a38; font-size: 0.78rem; font-style: italic;`
      : `color: #f0c040; font-family: 'Cinzel', serif; font-weight: 700; font-size: 1rem;`}
`;

const Body = styled.p`
  color: #5a4a38;
  font-size: 0.82rem;
  line-height: 1.55;
  margin: 0;
`;

const BottomNote = styled.p`
  text-align: center;
  color: #2e2618;
  font-size: 0.76rem;
  margin: 20px 0 0;
`;

export default function Tiers() {
  return (
    <Section id="tiers">
      <Wrap>
        <SectionEyebrow>Kickstarter Pledge Tiers</SectionEyebrow>
        <Heading>Choose Your Kingdom</Heading>
        <Preview>Preview only — pricing revealed at launch. Tiers subject to change.</Preview>
        <Grid>
          {TIERS.map((t) => (
            <Card key={t.title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.img} alt={t.alt} loading="lazy" width={300} height={225} />
              <CardBody>
                <CardHead>
                  <h3>{t.title}</h3>
                  <Price $italic={t.priceIsItalic}>{t.price}</Price>
                </CardHead>
                <Body>{t.body}</Body>
              </CardBody>
            </Card>
          ))}
        </Grid>
        <BottomNote>Sales open only after the Kickstarter campaign concludes.</BottomNote>
      </Wrap>
    </Section>
  );
}
