"use client";

import { useEffect, useState } from "react";

import { colors, font } from "@/lib/theme";
import { SplitFlap } from "./SplitFlap";

function parts(startsAt: string) {
  const diff = Math.max(0, new Date(startsAt).getTime() - Date.now());
  const totalMin = Math.floor(diff / 60000);
  return {
    hrs: String(Math.floor(totalMin / 60)).padStart(2, "0"),
    min: String(totalMin % 60).padStart(2, "0"),
  };
}

export function Countdown({ startsAt }: { startsAt: string }) {
  const [{ hrs, min }, set] = useState(() => parts(startsAt));

  useEffect(() => {
    const id = setInterval(() => set(parts(startsAt)), 1000);
    return () => clearInterval(id);
  }, [startsAt]);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ height: 42, display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 14, letterSpacing: 2, fontWeight: 700 }}>IN</span>
      </div>
      <Group value={hrs} label="HRS" />
      <div style={{ height: 42, display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 18, color: "#bbb", fontWeight: 700 }}>:</span>
      </div>
      <Group value={min} label="MIN" />
    </div>
  );
}

function Group({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <SplitFlap text={value} />
      <span
        style={{
          fontSize: 8,
          letterSpacing: 1.5,
          color: colors.faint,
          marginTop: 6,
          fontFamily: font.mono,
        }}
      >
        {label}
      </span>
    </div>
  );
}
