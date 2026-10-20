"use client";

import dynamic from "next/dynamic";

const Replay = dynamic(() => import("@/components/game/ReplayViewer"), { ssr: false });
export default Replay;
