"use client";

import { useState } from "react";

import { colors, font } from "@/lib/theme";
import type { ShareEvent } from "@/lib/types";
import { api, setToken } from "@/lib/api";
import { GoingConfirmation } from "./GoingConfirmation";
import { Sheet } from "./Sheet";

type Step = "pick" | "phone" | "otp" | "name" | "done";
type Choice = "going" | "declined";

const CHOICES: { value: Choice; label: string }[] = [
  { value: "going", label: "Going" },
  { value: "declined", label: "Can’t" },
];

export function RsvpFlow({ event }: { event: ShareEvent }) {
  const [step, setStep] = useState<Step>("pick");
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  async function rsvp() {
    if (!choice) return;
    await api("/events/" + event.id + "/rsvp", {
      method: "POST",
      body: { status: choice },
      auth: true,
    });
  }

  function pick(c: Choice) {
    setChoice(c);
    setStep("phone");
  }

  async function sendCode() {
    await api("/auth/start", { method: "POST", body: { phone } });
    setStep("otp");
  }

  async function verifyAndRsvp() {
    const { token, user } = await api<{
      token: string;
      user: { name: string | null };
    }>("/auth/verify", { method: "POST", body: { phone, code } });
    setToken(token);
    if (!user.name) {
      setStep("name");
    } else {
      await rsvp();
      setStep("done");
    }
  }

  async function finalize() {
    await api("/me", { method: "PATCH", body: { name }, auth: true });
    await rsvp();
    setStep("done");
  }

  if (step === "done") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: colors.surface,
          overflow: "auto",
        }}
      >
        <GoingConfirmation event={event} status={choice ?? "going"} />
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "18px 0 0" }}>
        <div style={s.label}>RSVP — NO APP NEEDED</div>
        <div style={s.segmented}>
          {CHOICES.map((c, i) => {
            const isGoing = c.value === "going";
            return (
              <button
                key={c.value}
                onClick={() => pick(c.value)}
                style={{
                  ...s.seg,
                  borderLeft: i > 0 ? "1px solid #E5E5E5" : "none",
                  background: isGoing ? colors.ink : "transparent",
                  color: isGoing ? "#fff" : colors.ink,
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        <div style={s.hint}>
          We&rsquo;ll text a code to confirm it&rsquo;s you.{" "}
          <span style={s.link}>Or open the app</span>
        </div>
      </div>

      {step === "phone" && (
        <Sheet onClose={() => setStep("pick")}>
          <SheetTitle>Confirm it&rsquo;s you to RSVP</SheetTitle>
          <div style={s.sub}>
            We&rsquo;ll text a 6-digit code — no password.
          </div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (415) 555-0134"
            inputMode="tel"
            style={s.input}
          />
          <button onClick={sendCode} style={s.primary}>
            Send code
          </button>
        </Sheet>
      )}

      {step === "otp" && (
        <Sheet onClose={() => setStep("pick")}>
          <SheetTitle>Confirm it&rsquo;s you to RSVP</SheetTitle>
          <div style={s.sub}>
            Code sent to {phone || "your number"} ·{" "}
            <span style={s.link} onClick={() => setStep("phone")}>
              Edit
            </span>
          </div>
          <OtpBoxes code={code} onChange={setCode} />
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: colors.faint,
              marginTop: 16,
            }}
          >
            Resend code in{" "}
            <span style={{ color: colors.ink, fontWeight: 600 }}>0:24</span>
          </div>
          <button onClick={verifyAndRsvp} style={s.primary}>
            Confirm &amp; RSVP
          </button>
        </Sheet>
      )}

      {step === "name" && (
        <Sheet onClose={() => setStep("pick")}>
          <div style={{ ...s.kicker, textAlign: "center" }}>LAST STEP</div>
          <SheetTitle>What should we call you?</SheetTitle>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              marginTop: 22,
            }}
          >
            <div style={s.avatar}>{(name.trim()[0] || "?").toUpperCase()}</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={s.nameInput}
            />
            <div style={{ fontSize: 10.5, color: colors.faint }}>
              friends will see this on the plan
            </div>
          </div>
          <button onClick={finalize} style={s.primary}>
            Confirm RSVP
          </button>
        </Sheet>
      )}
    </>
  );
}

function SheetTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: font.sans,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "-0.4px",
        textAlign: "center",
        marginTop: 10,
      }}
    >
      {children}
    </div>
  );
}

function OtpBoxes({
  code,
  onChange,
}: {
  code: string;
  onChange: (v: string) => void;
}) {
  const cells = Array.from({ length: 6 });
  return (
    <div style={{ position: "relative", marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 7 }}>
        {cells.map((_, i) => {
          const ch = code[i];
          const current = i === code.length;
          return (
            <span
              key={i}
              style={ch ? s.otpFilled : current ? s.otpCurrent : s.otpEmpty}
            >
              {ch ??
                (current ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: 28,
                      background: colors.ink,
                      animation: "sq-caret 1.1s steps(1) infinite",
                    }}
                  />
                ) : null)}
            </span>
          );
        })}
      </div>
      <input
        value={code}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        inputMode="numeric"
        autoFocus
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          width: "100%",
          height: "100%",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

const otpBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  height: 62,
  borderRadius: 7,
  fontSize: 29,
  fontWeight: 700,
};

const s: Record<string, React.CSSProperties> = {
  label: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.faint,
    marginBottom: 10,
  },
  segmented: {
    display: "flex",
    border: `1px solid ${colors.ink}`,
    borderRadius: 12,
    overflow: "hidden",
    fontFamily: font.sans,
    fontSize: 13,
  },
  seg: {
    flex: 1,
    textAlign: "center",
    padding: "14px 0",
    background: "transparent",
    border: "none",
    fontFamily: font.sans,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  hint: {
    textAlign: "center",
    fontSize: 12,
    color: colors.muted,
    marginTop: 12,
    fontFamily: font.sans,
  },
  link: {
    color: colors.ink,
    fontWeight: 600,
    textDecoration: "underline",
    cursor: "pointer",
  },
  kicker: { fontSize: 10, letterSpacing: 2, color: colors.faint },
  sub: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 1.6,
    marginTop: 9,
  },
  input: {
    width: "100%",
    fontFamily: font.mono,
    fontSize: 18,
    color: colors.ink,
    background: colors.surface,
    border: `1px solid ${colors.hair}`,
    borderRadius: 12,
    padding: "14px 14px",
    marginTop: 20,
    outline: "none",
  },
  nameInput: {
    fontFamily: font.sans,
    fontSize: 25,
    fontWeight: 700,
    letterSpacing: "-0.4px",
    textAlign: "center",
    border: "none",
    borderBottom: `2px solid ${colors.ink}`,
    outline: "none",
    padding: "4px 0",
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: "50%",
    background: colors.ink,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: font.sans,
    fontSize: 30,
    fontWeight: 600,
  },
  primary: {
    width: "100%",
    background: colors.ink,
    color: "#fff",
    border: "none",
    borderRadius: 13,
    padding: "16px 0",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: font.sans,
    marginTop: 18,
    cursor: "pointer",
  },
  otpFilled: {
    ...otpBase,
    background: `linear-gradient(180deg, ${colors.flapTop} 0 50%, ${colors.flapBottom} 50% 100%)`,
    color: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
  },
  otpCurrent: {
    ...otpBase,
    background: "#F4F4F2",
    border: `2px solid ${colors.ink}`,
    color: colors.ink,
  },
  otpEmpty: { ...otpBase, background: "#F4F4F2" },
};
