"use client";

import { Fragment, useEffect, useState } from "react";

import { detailedCountdown } from "@/lib/countdown";
import { colors, font } from "@/lib/theme";
import { SplitFlap } from "./SplitFlap";

export function Countdown({ startsAt }: { startsAt: string }) {
  const [units, set] = useState(() => detailedCountdown(startsAt).units);

  useEffect(() => {
    const id = setInterval(() => set(detailedCountdown(startsAt).units), 1000);
    return () => clearInterval(id);
  }, [startsAt]);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
      <span style={{ ...s.furniture, fontSize: 15, letterSpacing: 1 }}>in</span>
      {units.map((unit, i) => (
        <Fragment key={unit.label}>
          {i > 0 ? (
            <span style={{ ...s.furniture, fontSize: 20, color: colors.ghost }}>
              :
            </span>
          ) : null}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 7,
            }}
          >
            <SplitFlap text={unit.value} />
            <span style={s.unitLabel}>{unit.label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  furniture: {
    fontFamily: font.mono,
    fontWeight: 700,
    color: colors.ink,
    height: 46,
    lineHeight: "46px",
  },
  unitLabel: {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 0.75,
    color: colors.faint,
  },
};
