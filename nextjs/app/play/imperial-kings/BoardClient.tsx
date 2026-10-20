"use client";

import dynamic from "next/dynamic";

const Board = dynamic(() => import("@/components/game/ImperialKingsBoard"), { ssr: false });
export default Board;
