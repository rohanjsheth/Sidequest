import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, ApiError } from "@/lib/api";
import { Font, SQ } from "@/constants/sidequest";

function formatUSPhone(d: string) {
  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 10);
  if (!d) return "";
  if (d.length < 4) return `(${a}`;
  if (d.length < 7) return `(${a}) ${b}`;
  return `(${a}) ${b}-${c}`;
}

export default function Phone() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const complete = phone.length === 10;

  const inputRef = useRef<TextInput>(null);

  async function sendCode() {
    if (!complete || sending) return;
    setError(null);
    setSending(true);
    try {
      await api("/auth/start", { method: "POST", body: { phone } });
      router.push({ pathname: "/verify", params: { phone } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
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
        <Text style={styles.title}>{"What's your\nnumber?"}</Text>
        <Text style={styles.sub}>
          {"We'll text a code to verify it's you.\nNo spam, ever."}
        </Text>
      </View>

      <Pressable
        style={styles.inputRow}
        onPress={() => inputRef.current?.focus()}
      >
        <View style={styles.cc}>
          <Text style={styles.flag}>🇺🇸</Text>
          <Text style={styles.ccText}>+1</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.number}>{formatUSPhone(phone)}</Text>
          <View style={styles.caret} />
        </View>
      </Pressable>

      <TextInput
        ref={inputRef}
        value={phone}
        onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        autoFocus
        maxLength={10}
        style={styles.hiddenInput}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.cta, (!complete || sending) && styles.ctaOff]}
        onPress={sendCode}
        disabled={!complete || sending}
      >
        <Text style={styles.ctaText}>{sending ? "Sending…" : "Send code"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SQ.card },
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
    fontFamily: Font.mono,
    fontSize: 13,
    lineHeight: 20,
    color: SQ.muted,
    marginTop: 13,
  },

  inputRow: {
    paddingHorizontal: 28,
    paddingTop: 30,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  cc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#EAEAEA",
    borderRadius: 11,
  },
  flag: { fontSize: 18 },
  ccText: { fontFamily: Font.sansSemibold, fontSize: 16, color: SQ.ink },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: SQ.ink,
    paddingVertical: 11,
    paddingHorizontal: 4,
  },
  number: {
    fontFamily: Font.monoMedium,
    fontSize: 24,
    letterSpacing: 1,
    color: SQ.ink,
  },
  caret: { width: 2, height: 26, backgroundColor: SQ.ink, marginLeft: 3 },

  hiddenInput: { position: "absolute", opacity: 0, height: 1, width: 1 },

  cta: {
    backgroundColor: SQ.ink,
    borderRadius: 13,
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 28,
    marginHorizontal: 28,
  },
  ctaOff: { opacity: 0.35 },
  ctaText: { fontFamily: Font.sansSemibold, fontSize: 14, color: SQ.card },
  error: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: "#B3261E",
    textAlign: "center",
    marginHorizontal: 28,
    marginTop: 16,
  },
});
