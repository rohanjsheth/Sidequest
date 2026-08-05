import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, ApiError } from "@/lib/api";
import { useSession, type SessionUser } from "@/lib/session";
import { Font, SQ, Type } from "@/constants/sidequest";
import { ColorBlurBackground } from "@/components/color-blur-bg";

const RESEND_SECONDS = 30;

function formatUSPhone(d: string) {
  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${a}) ${b}`;
  return `(${a}) ${b}-${c}`;
}

export default function Verify() {
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { signIn } = useSession();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  useEffect(() => {
    if (code.length === 6 && !verifying) verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function verify() {
    setError(null);
    setVerifying(true);
    try {
      const { token, user } = await api<{ token: string; user: SessionUser }>(
        "/auth/verify",
        { method: "POST", body: { phone, code } },
      );
      await signIn(token, user);
      // session state flips → Stack.Protected routes to set-name or tabs
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setCode("");
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    if (seconds > 0) return;
    setError(null);
    try {
      await api("/auth/start", { method: "POST", body: { phone } });
      setSeconds(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  const cells = Array.from({ length: 6 }, (_, i) => code[i] ?? "");
  const activeIndex = code.length;

  return (
    <ColorBlurBackground>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            style={styles.back}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Feather name="chevron-left" size={18} color="#444" />
          </Pressable>
        </View>

        <View style={styles.intro}>
          <Text style={styles.title}>Enter the code</Text>
          <Text style={styles.sub}>
            sent to +1 {formatUSPhone(phone ?? "")} ·{" "}
            <Text style={styles.edit} onPress={() => router.back()}>
              Edit
            </Text>
          </Text>
        </View>
        <Pressable onPress={() => inputRef.current?.focus()}>
          <View style={styles.otp}>
            {cells.map((d, i) => {
              const filled = d !== "";
              const active = i === activeIndex;
              return (
                <View
                  key={i}
                  style={[
                    styles.cell,
                    filled
                      ? styles.cellFilled
                      : active
                        ? styles.cellActive
                        : styles.cellEmpty,
                  ]}
                >
                  {filled ? <View style={styles.cellBottom} /> : null}
                  {filled ? (
                    <Text style={styles.cellDigit}>{d}</Text>
                  ) : active ? (
                    <View style={styles.caret} />
                  ) : null}
                </View>
              );
            })}
          </View>
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          autoFocus
          maxLength={6}
          style={styles.hiddenInput}
        />

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <Pressable
            onPress={resend}
            disabled={seconds > 0}
            style={styles.resendWrap}
          >
            <Text style={styles.resend}>
              {seconds > 0
                ? `Resend code in 0:${String(seconds).padStart(2, "0")}`
                : "Resend code"}
            </Text>
          </Pressable>
        )}
      </View>
    </ColorBlurBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 22 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SQ.fill,
    alignItems: "center",
    justifyContent: "center",
  },

  intro: { paddingHorizontal: 28, paddingTop: 22 },
  title: {
    fontFamily: Font.sansBold,
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -0.6,
    color: SQ.ink,
  },
  sub: {
    fontFamily: Font.sans,
    fontSize: 13,
    lineHeight: 20,
    color: SQ.muted,
    marginTop: 13,
  },
  edit: { color: SQ.ink, textDecorationLine: "underline" },

  otp: {
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 24,
    paddingTop: 34,
  },
  cell: {
    flex: 1,
    height: 64,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cellFilled: { backgroundColor: SQ.flapTop },
  cellActive: { backgroundColor: SQ.fill, borderWidth: 2, borderColor: SQ.ink },
  cellEmpty: { backgroundColor: SQ.fill },
  cellBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 32,
    backgroundColor: SQ.flapBottom,
  },
  cellDigit: { ...Type.tabularStrong, fontSize: 30, color: SQ.card },
  caret: { width: 2, height: 30, backgroundColor: SQ.ink },

  resendWrap: { paddingTop: 22, alignItems: "center" },
  resend: { fontFamily: Font.sans, fontSize: 12, color: SQ.faint },
  error: {
    fontFamily: Font.sans,
    fontSize: 12,
    color: SQ.danger,
    textAlign: "center",
    paddingTop: 22,
  },

  hiddenInput: { position: "absolute", opacity: 0, height: 1, width: 1 },
});
