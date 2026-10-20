"use client";

import dynamic from "next/dynamic";

const Player = dynamic(() => import("@/components/game/PuzzlePlayer"), { ssr: false });
export default Player;
