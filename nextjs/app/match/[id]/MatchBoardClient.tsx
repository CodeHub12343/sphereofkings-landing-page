"use client";

import dynamic from "next/dynamic";

const MatchBoard = dynamic(() => import("@/components/game/MatchBoard"), { ssr: false });
export default MatchBoard;
