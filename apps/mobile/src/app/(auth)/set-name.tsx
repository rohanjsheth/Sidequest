import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, ApiError } from "@/lib/api";
import { useSession, type SessionUser } from "@/lib/session";
import { Font, SQ } from "@/constants/sidequest";
import { ColorBlurBackground } from "@/components/color-blur-bg";

export default function SetName() {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useSession();

  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim().length > 0;
  const initial = name.trim() ? name.trim()[0].toUpperCase() : "A";

  async function save() {
    if (!canSave || saving) return;
    setError(null);
    setSaving(true);
    try {
      const { user: updated } = await api<{ user: SessionUser }>("/me", {
        method: "PATCH",
        body: { name: name.trim() },
        auth: true,
      });
      setUser(updated);
      // hasName flips true → Stack.Protected routes into the tabs
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ColorBlurBackground>
      <View style={styles.screen}>
      <View style={[styles.intro, { paddingTop: insets.top + 26 }]}>
        <Text style={styles.title}>What should{"\n"}we call you?</Text>
        <Text style={styles.sub}>
          This is how friends will spot you on the board.
        </Text>
      </View>

      <View style={styles.center}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={SQ.ghost}
          style={styles.input}
          autoFocus
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={save}
        />
        <View style={styles.underline} />
        <Text style={styles.caption}>your display name</Text>
      </View>

      <View style={styles.spacer} />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.cta, (!canSave || saving) && styles.ctaOff]}
          onPress={save}
          disabled={!canSave || saving}
        >
          <Text style={styles.ctaText}>{saving ? "Saving…" : "Continue"}</Text>
        </Pressable>
      </View>
      </View>
    </ColorBlurBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  intro: { paddingHorizontal: 28 },
  title: {
    fontFamily: Font.sansBold,
    fontSize: 29,
    lineHeight: 33,
    letterSpacing: -0.6,
    color: SQ.ink,
  },
  sub: {
    fontFamily: Font.mono,
    fontSize: 13,
    lineHeight: 20,
    color: SQ.muted,
    marginTop: 12,
  },

  center: { alignItems: "center", paddingTop: 40, gap: 18 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: SQ.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: Font.sansSemibold,
    fontSize: 34,
    color: SQ.card,
  },
  input: {
    fontFamily: Font.sansBold,
    fontSize: 27,
    letterSpacing: -0.4,
    color: SQ.ink,
    textAlign: "center",
    minWidth: 160,
    paddingVertical: 2,
  },
  underline: { width: 160, height: 2, backgroundColor: SQ.ink, marginTop: -6 },
  caption: {
    fontFamily: Font.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: SQ.faint,
  },

  spacer: { flex: 1 },

  footer: { paddingHorizontal: 24, paddingTop: 14 },
  error: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: "#B3261E",
    textAlign: "center",
    marginBottom: 8,
  },
  cta: {
    backgroundColor: SQ.ink,
    borderRadius: 13,
    alignItems: "center",
    paddingVertical: 17,
  },
  ctaOff: { opacity: 0.35 },
  ctaText: { fontFamily: Font.sansSemibold, fontSize: 14, color: SQ.card },
});
