"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  VIDEOS,
  VideoEntry,
  VideoChapter,
  CHAPTER_LABEL,
  CHAPTER_TONE,
} from "@/lib/videos";
import ShareButton from "./ShareButton";

type Filter = "all" | VideoChapter;

// Newest owner-approved trailer sits in the Watch-first slot.
const FEATURED_ID = "trailer-october-20";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Feat = styled.article`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 16px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Frame = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;

  video,
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
`;

const FeatBody = styled.div`
  padding: clamp(20px, 2.5vw, 28px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
`;

const Eye = styled.div<{ $tone: "gold" | "crim" | "royal" | "muted" }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: "Cinzel", serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${(p) =>
    p.$tone === "gold"
      ? "#c9a227"
      : p.$tone === "crim"
      ? "#ff6b7a"
      : p.$tone === "royal"
      ? "#7fa3ff"
      : "#a89880"};

  &::before {
    content: "";
    width: 24px;
    height: 1px;
    background: currentColor;
  }
`;

const FeatTitle = styled.h2`
  font-family: "Cinzel", serif;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  color: #f5f0e8;
  margin: 0;
  font-weight: 800;
  line-height: 1.15;
`;

const FeatLede = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #a89880;
  margin: 0;
`;

const FeatMeta = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #5a4a38;
  margin-top: 4px;

  span.dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const Filters = styled.nav`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`;

const F = styled.button<{ $on: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  background: ${(p) => (p.$on ? "rgba(201,162,39,0.14)" : "#0e0c09")};
  color: ${(p) => (p.$on ? "#f0c040" : "#a89880")};
  border: 1px solid ${(p) => (p.$on ? "#c9a227" : "#1e1a12")};

  &:hover {
    color: #f5f0e8;
  }
  &:focus-visible {
    outline: 2px solid #c9a227;
    outline-offset: 2px;
  }

  .count {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 0.7rem;
    opacity: 0.75;
    margin-left: 6px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article<{ $disabled: boolean }>`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: ${(p) => (p.$disabled ? 0.75 : 1)};
`;

const Thumb = styled.div<{ $playable: boolean }>`
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
  cursor: ${(p) => (p.$playable ? "pointer" : "not-allowed")};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Chip = styled.span<{ $tone: "gold" | "crim" | "royal" | "muted" }>`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(10, 10, 12, 0.78);
  color: ${(p) =>
    p.$tone === "gold"
      ? "#f0c040"
      : p.$tone === "crim"
      ? "#ff6b7a"
      : p.$tone === "royal"
      ? "#7fa3ff"
      : "#a89880"};
  padding: 4px 10px;
  border-radius: 999px;
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Dur = styled.span`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(10, 10, 12, 0.85);
  color: #f5f0e8;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
`;

const Cc = styled.span`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(10, 10, 12, 0.85);
  color: #f5f0e8;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 3px;
  letter-spacing: 0.08em;
`;

const Play = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(240, 192, 64, 0.25);
  transition: transform 0.15s;

  &:hover {
    transform: translate(-50%, -50%) scale(1.05);
  }
  &:focus-visible {
    outline: 3px solid #f0c040;
    outline-offset: 3px;
  }
`;

const DraftOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 12, 0.6);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  color: #e0a94a;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const CardBody = styled.div`
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.05rem;
  line-height: 1.2;
  color: #f5f0e8;
  margin: 0;
  font-weight: 700;
`;

const CardDesc = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #a89880;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PlayerShell = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;

  video {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

function formatDuration(seconds?: number): string | null {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function matchesFilter(c: VideoChapter, f: Filter): boolean {
  if (f === "all") return true;
  return c === f;
}

export default function VideoGallery() {
  const [filter, setFilter] = useState<Filter>("all");
  const [featPlaying, setFeatPlaying] = useState(false);
  const [activePlay, setActivePlay] = useState<string | null>(null);

  const featured = VIDEOS.find((v) => v.id === FEATURED_ID) ?? VIDEOS[0];
  const rest = VIDEOS.filter((v) => v.id !== featured.id);
  const filtered = rest.filter((v) => matchesFilter(v.chapter, filter));

  const counts = useMemo(() => {
    return {
      all: rest.length,
      trailer: rest.filter((v) => v.chapter === "trailer").length,
      gameplay: rest.filter((v) => v.chapter === "gameplay").length,
      instructions: rest.filter((v) => v.chapter === "instructions").length,
      "behind-the-scenes": rest.filter(
        (v) => v.chapter === "behind-the-scenes",
      ).length,
    };
  }, [rest]);

  // Deep-link scroll: when the page loads with a #video-id hash, scroll
  // to that card, auto-play if it has a src, and briefly highlight it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      // Give the gallery one tick to lay out before scrolling.
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const target = VIDEOS.find((v) => v.id === hash);
        if (!target || !target.src) return;
        if (target.id === FEATURED_ID) setFeatPlaying(true);
        else setActivePlay(target.id);
      });
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const openCard = (v: VideoEntry) => {
    if (!v.src) return;
    setActivePlay(v.id);
  };

  return (
    <Section aria-label="Approved Sphere of Kings videos">
      <Feat id={featured.id}>
        <Frame>
          {featured.src ? (
            featPlaying ? (
              <PlayerShell>
                <video
                  controls
                  autoPlay
                  preload="metadata"
                  playsInline
                  poster={featured.poster}
                >
                  <source src={featured.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </PlayerShell>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.poster} alt={featured.title} />
                <Play
                  type="button"
                  onClick={() => setFeatPlaying(true)}
                  aria-label={`Play ${featured.title}`}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M8 5l10 6-10 6V5Z" fill="currentColor" />
                  </svg>
                </Play>
              </>
            )
          ) : (
            // Honest fallback if the featured trailer loses its URL.
            // eslint-disable-next-line @next/next/no-img-element
            <>
              <img src={featured.poster} alt={featured.title} />
              <DraftOverlay>Trailer not published</DraftOverlay>
            </>
          )}
        </Frame>
        <FeatBody>
          <Eye $tone={CHAPTER_TONE[featured.chapter]}>
            Watch first · {CHAPTER_LABEL[featured.chapter]}
          </Eye>
          <FeatTitle>{featured.title}</FeatTitle>
          <FeatLede>{featured.description}</FeatLede>
          <FeatMeta>
            <span>No autoplay with sound</span>
            <span className="dot" aria-hidden="true" />
            <span>{featured.captions ? "Captions · English" : "Captions pending"}</span>
          </FeatMeta>
          <FeatShare>
            <ShareButton
              title={featured.title}
              text={featured.description}
              hash={featured.id}
            />
          </FeatShare>
        </FeatBody>
      </Feat>

      <Filters role="group" aria-label="Filter videos by chapter">
        <F $on={filter === "all"} onClick={() => setFilter("all")}>
          All <span className="count">{counts.all}</span>
        </F>
        <F
          $on={filter === "gameplay"}
          onClick={() => setFilter("gameplay")}
        >
          Gameplay <span className="count">{counts.gameplay}</span>
        </F>
        <F
          $on={filter === "instructions"}
          onClick={() => setFilter("instructions")}
        >
          Instructions <span className="count">{counts.instructions}</span>
        </F>
        <F
          $on={filter === "behind-the-scenes"}
          onClick={() => setFilter("behind-the-scenes")}
        >
          Behind the scenes{" "}
          <span className="count">{counts["behind-the-scenes"]}</span>
        </F>
      </Filters>

      <Grid>
        {filtered.map((v) => {
          const playable = !!v.src;
          const playing = activePlay === v.id;
          const dur = formatDuration(v.durationSeconds);
          return (
            <Card key={v.id} id={v.id} $disabled={!playable}>
              <Thumb
                $playable={playable}
                onClick={() => playable && !playing && openCard(v)}
                role={playable ? "button" : undefined}
                tabIndex={playable ? 0 : -1}
                onKeyDown={(e) => {
                  if (!playable || playing) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCard(v);
                  }
                }}
              >
                {playing && v.src ? (
                  <video
                    controls
                    autoPlay
                    preload="metadata"
                    playsInline
                    poster={v.poster}
                  >
                    <source src={v.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {v.poster ? (
                      <img src={v.poster} alt="" />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background:
                            "radial-gradient(circle at 60% 40%, rgba(201,162,39,0.12), transparent 60%), #0a0a0a",
                        }}
                      />
                    )}
                    <Chip $tone={CHAPTER_TONE[v.chapter]}>
                      {CHAPTER_LABEL[v.chapter]}
                    </Chip>
                    {v.captions && <Cc>CC</Cc>}
                    {dur ? <Dur>{dur}</Dur> : !playable && <Dur>—</Dur>}
                    {playable ? (
                      <Play
                        type="button"
                        aria-label={`Play ${v.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openCard(v);
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M6 4l10 5-10 5V4Z"
                            fill="currentColor"
                          />
                        </svg>
                      </Play>
                    ) : (
                      <DraftOverlay>Coming soon</DraftOverlay>
                    )}
                  </>
                )}
              </Thumb>
              <CardBody>
                <CardTitle>{v.title}</CardTitle>
                <CardDesc>{v.description}</CardDesc>
                <CardShare>
                  <ShareButton
                    title={v.title}
                    text={v.description}
                    hash={v.id}
                  />
                </CardShare>
              </CardBody>
            </Card>
          );
        })}
      </Grid>

      {filtered.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            border: "1px dashed #2e2618",
            borderRadius: 12,
            color: "#a89880",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.92rem",
            lineHeight: 1.6,
          }}
        >
          Nothing here yet.{" "}
          <span style={{ color: "#5a4a38" }}>
            We publish videos one chapter at a time, each after the owner
            approves it.
          </span>
        </div>
      )}
    </Section>
  );
}

const FeatShare = styled.div`
  margin-top: 10px;
  display: flex;
`;

const CardShare = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-start;
`;
