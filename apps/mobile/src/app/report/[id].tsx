import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, ApiError } from "@/lib/api";
import { Font, SQ } from "@/constants/sidequest";

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = body.trim().length > 0 && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await api(`/reports/${id}`, {
        method: "POST",
        body: { reportBody: body.trim() },
        auth: true,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <View style={styles.headerSpacer} />
          <Text style={styles.heading}>REPORT SENT</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.doneBody}>
          <View style={styles.doneMark}>
            <Feather name="check" size={26} color={SQ.card} />
          </View>
          <Text style={styles.doneTitle}>Thanks for flagging this</Text>
          <Text style={styles.doneSub}>
            Our team reviews reports within 24 hours and removes anything that
            violates our guidelines.
          </Text>
        </View>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
          <Pressable style={styles.cta} onPress={() => router.back()}>
            <Text style={styles.ctaText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.heading}>REPORT PLAN</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
      >
        {title ? (
          <Text style={styles.context} numberOfLines={2}>
            Reporting <Text style={styles.contextStrong}>{title}</Text>
          </Text>
        ) : null}
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Tell us what's wrong — spam, harassment, or inappropriate or unsafe content…"
          placeholderTextColor={SQ.hint}
          style={styles.input}
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.cta, !canSubmit && styles.ctaOff]}
          onPress={submit}
          disabled={!canSubmit}
        >
          <Text style={styles.ctaText}>
            {submitting ? "Sending…" : "Submit report"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SQ.card },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: SQ.hair,
  },
  cancel: { fontFamily: Font.sans, fontSize: 13, color: SQ.muted },
  headerSpacer: { width: 42 },
  heading: {
    fontFamily: Font.monoBold,
    fontSize: 11,
    letterSpacing: 2,
    color: SQ.ink,
  },

  body: { flex: 1 },
  bodyContent: { paddingBottom: 24 },

  context: {
    paddingHorizontal: 24,
    paddingTop: 20,
    fontFamily: Font.mono,
    fontSize: 12,
    color: SQ.faint,
  },
  contextStrong: { fontFamily: Font.sansSemibold, color: SQ.ink },

  input: {
    paddingHorizontal: 24,
    paddingTop: 16,
    minHeight: 170,
    fontFamily: Font.sans,
    fontSize: 16,
    lineHeight: 24,
    color: SQ.ink,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: SQ.line,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  error: {
    fontFamily: Font.sansMedium,
    fontSize: 13,
    color: "#B3261E",
    textAlign: "center",
    marginBottom: 10,
  },
  cta: {
    backgroundColor: SQ.ink,
    borderRadius: 13,
    alignItems: "center",
    paddingVertical: 17,
  },
  ctaOff: { opacity: 0.35 },
  ctaText: { fontFamily: Font.sansSemibold, fontSize: 14, color: SQ.card },

  doneBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 14,
  },
  doneMark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SQ.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  doneTitle: {
    fontFamily: Font.sansBold,
    fontSize: 20,
    letterSpacing: -0.3,
    color: SQ.ink,
  },
  doneSub: {
    fontFamily: Font.mono,
    fontSize: 12.5,
    lineHeight: 19,
    color: SQ.faint,
    textAlign: "center",
  },
});
