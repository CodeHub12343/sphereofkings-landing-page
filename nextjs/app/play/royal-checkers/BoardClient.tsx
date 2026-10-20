"use client";

import dynamic from "next/dynamic";

const Board = dynamic(() => import("@/components/game/RoyalCheckersBoard"), { ssr: false });
export default Board;
