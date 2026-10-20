"use client";

import dynamic from "next/dynamic";

export const ChallengeButton = dynamic(() => import("@/components/game/ChallengeButton"), { ssr: false });
export const ReportButton = dynamic(() => import("@/components/ReportButton"), { ssr: false });
