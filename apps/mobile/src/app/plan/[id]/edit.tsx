import { Feather } from "@expo/vector-icons";
import { DatePicker, Host } from "@expo/ui/swift-ui";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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

type Plan = {
  id: string;
  title: string;
  location: string;
  description: string | null;
  startsAt: string;
  cancelled: boolean;
};

export default function EditPlan() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  // the values we loaded, so submit can send only what actually changed
  const [original, setOriginal] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { event } = await api<{ event: Plan }>(`/events/${id}`, {
          auth: true,
        });
        if (!active) return;
        setOriginal(event);
        setTitle(event.title);
        setLocation(event.location);
        setNote(event.description ?? "");
        setStartsAt(new Date(event.startsAt));
        setLoaded(true);
      } catch (err) {
        if (active)
          setError(
            err instanceof ApiError ? err.message : "Something went wrong",
          );
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const canSubmit =
    loaded && title.trim() !== "" && location.trim() !== "" && !saving;

  function changedFields() {
    if (!original) return {};

    const updates: Record<string, string> = {};
    if (title.trim() !== original.title) updates.title = title.trim();
    if (location.trim() !== original.location)
      updates.location = location.trim();
    if (note.trim() !== (original.description ?? ""))
      updates.description = note.trim();
    if (startsAt.toISOString() !== new Date(original.startsAt).toISOString())
      updates.startsAt = startsAt.toISOString();
    return updates;
  }

  async function save() {
    if (!canSubmit) return;

    const updates = changedFields();
    if (Object.keys(updates).length === 0) {
      router.back();
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await api(`/events/${id}`, {
        method: "PATCH",
        body: updates,
        auth: true,
      });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function confirmCancelPlan() {
    Alert.alert(
      "Cancel this plan?",
      "It disappears from everyone's board. This can't be undone.",
      [
        { text: "Keep it", style: "cancel" },
        { text: "Cancel plan", style: "destructive", onPress: cancelPlan },
      ],
    );
  }

  async function cancelPlan() {
    if (cancelling) return;

    setError(null);
    setCancelling(true);
    try {
      await api(`/events/${id}`, {
        method: "PATCH",
        body: { cancelled: true },
        auth: true,
      });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setCancelling(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.heading}>EDIT PLAN</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Name your plan"
          placeholderTextColor={SQ.ghost}
          style={styles.title}
          multiline
          editable={loaded}
        />

        <View style={styles.fields}>
          <View style={styles.row}>
            <Feather name="clock" size={16} color={SQ.faint} />
            <Text style={styles.rowLabel}>WHEN</Text>
            <View style={styles.rowControl}>
              {loaded ? (
                <Host matchContents>
                  <DatePicker
                    selection={startsAt}
                    displayedComponents={["date", "hourAndMinute"]}
                    onDateChange={setStartsAt}
                  />
                </Host>
              ) : null}
            </View>
          </View>

          <View style={[styles.row, styles.rowLast]}>
            <Feather name="map-pin" size={16} color={SQ.faint} />
            <Text style={styles.rowLabel}>WHERE</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Add a place"
              placeholderTextColor={SQ.ghost}
              style={styles.rowInput}
              editable={loaded}
            />
          </View>
        </View>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Add a note — what's the vibe?"
          placeholderTextColor={SQ.ghost}
          style={styles.note}
          multiline
          editable={loaded}
        />

        {/* audience is fixed at creation — PATCH doesn't move a plan between lists */}
        {loaded && !original?.cancelled ? (
          <Pressable
            style={styles.cancelPlan}
            onPress={confirmCancelPlan}
            disabled={cancelling}
          >
            <Text style={[styles.cancelPlanText, cancelling && styles.dim]}>
              {cancelling ? "Cancelling..." : "Cancel plan"}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.cta, !canSubmit && styles.ctaOff]}
          onPress={save}
          disabled={!canSubmit}
        >
          <Text style={styles.ctaText}>
            {saving ? "Saving…" : "Save changes"}
          </Text>
        </Pressable>
      </View>
    </View>
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
    borderBottomColor: SQ.rule,
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

  title: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 4,
    fontFamily: Font.sansBold,
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 30,
    color: SQ.ink,
  },

  fields: { paddingHorizontal: 24, paddingTop: 22 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: SQ.rule,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: {
    width: 54,
    fontFamily: Font.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: SQ.faint,
  },
  rowControl: { flex: 1, alignItems: "flex-start", minHeight: 34 },
  rowInput: {
    flex: 1,
    padding: 0,
    fontFamily: Font.sansMedium,
    fontSize: 14,
    color: SQ.ink,
  },

  note: {
    paddingHorizontal: 24,
    paddingTop: 8,
    fontFamily: Font.sans,
    fontSize: 14,
    lineHeight: 22,
    color: SQ.text,
  },

  cancelPlan: { marginTop: 32, paddingHorizontal: 24, paddingVertical: 14 },
  cancelPlanText: {
    fontFamily: Font.sansMedium,
    fontSize: 14,
    color: SQ.danger,
  },
  dim: { opacity: 0.45 },

  footer: {
    borderTopWidth: 1,
    borderTopColor: SQ.line,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  error: {
    fontFamily: Font.sansMedium,
    fontSize: 13,
    color: SQ.danger,
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
});
