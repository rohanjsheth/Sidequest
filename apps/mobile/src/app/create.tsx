import { Feather } from "@expo/vector-icons";
import { DatePicker, Host } from "@expo/ui/swift-ui";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, ApiError } from "@/lib/api";
import { Font, SQ, Type } from "@/constants/sidequest";

type FriendList = { id: string; name: string; memberCount: number };

function audienceOptions(lists: FriendList[]) {
  return [
    { id: null, name: "Everyone", hint: "All your friends" },
    ...lists.map((l) => ({
      id: l.id,
      name: l.name,
      hint: `${l.memberCount} ${l.memberCount === 1 ? "person" : "people"}`,
    })),
  ] as { id: string | null; name: string; hint: string }[];
}

function nextHalfHour() {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() <= 30 ? 30 : 60);
  return d;
}

export default function CreateScreen() {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState<Date>(nextHalfHour);
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lists, setLists] = useState<FriendList[]>([]);
  const [audienceId, setAudienceId] = useState<string | null>(null);
  const [pickingAudience, setPickingAudience] = useState(false);

  const audience = lists.find((l) => l.id === audienceId) ?? null;
  const canSubmit = title.trim() !== "" && location.trim() !== "";

  useEffect(() => {
    api<{ lists: FriendList[] }>("/lists", { auth: true })
      .then(({ lists }) => setLists(lists))
      .catch(() => setLists([]));
  }, []);

  async function createPlan() {
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    const trimmedNote = note.trim();
    try {
      await api("/events", {
        method: "POST",
        body: {
          title: title.trim(),
          location: location.trim(),
          startsAt: startsAt.toISOString(),
          description: trimmedNote || undefined,
          audienceListId: audienceId,
        },
        auth: true,
      });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.heading}>New plan</Text>
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
        />

        <View style={styles.fields}>
          <View style={styles.row}>
            <Feather name="clock" size={16} color={SQ.faint} />
            <Text style={styles.rowLabel}>when</Text>
            <View style={styles.rowControl}>
              <Host matchContents>
                <DatePicker
                  selection={startsAt}
                  displayedComponents={["date", "hourAndMinute"]}
                  onDateChange={setStartsAt}
                />
              </Host>
            </View>
          </View>

          <View style={styles.row}>
            <Feather name="map-pin" size={16} color={SQ.faint} />
            <Text style={styles.rowLabel}>where</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Add a place"
              placeholderTextColor={SQ.ghost}
              style={styles.rowInput}
            />
          </View>

          <Pressable
            style={[styles.row, styles.rowLast]}
            onPress={() => setPickingAudience((open) => !open)}
          >
            <Feather name="users" size={16} color={SQ.faint} />
            <Text style={styles.rowLabel}>who</Text>
            <Text style={styles.rowValue}>
              {audience ? audience.name : "Everyone"}
            </Text>
            <Feather
              name={pickingAudience ? "chevron-up" : "chevron-down"}
              size={15}
              color={SQ.faint}
            />
          </Pressable>

          {pickingAudience ? (
            <View style={styles.options}>
              {audienceOptions(lists).map((opt) => {
                const selected = opt.id === audienceId;
                return (
                  <Pressable
                    key={opt.id ?? "everyone"}
                    style={[styles.option, selected && styles.optionOn]}
                    onPress={() => {
                      setAudienceId(opt.id);
                      setPickingAudience(false);
                    }}
                  >
                    <View style={styles.optionBody}>
                      <Text style={styles.optionName}>{opt.name}</Text>
                      <Text style={styles.optionHint}>{opt.hint}</Text>
                    </View>
                    {selected ? (
                      <Feather name="check" size={15} color={SQ.ink} />
                    ) : null}
                  </Pressable>
                );
              })}
              {lists.length === 0 ? (
                <Text style={styles.optionEmpty}>
                  Make a list in Friends to send a plan to just some people.
                </Text>
              ) : null}
            </View>
          ) : null}

          {audience?.memberCount === 0 ? (
            <Text style={styles.caution}>
              Nobody's in this list yet — no one will be notified.
            </Text>
          ) : null}
        </View>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Add a note — what's the vibe?"
          placeholderTextColor={SQ.ghost}
          style={styles.note}
          multiline
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.cta, (!canSubmit || submitting) && styles.ctaOff]}
          onPress={createPlan}
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.ctaText}>
            {submitting ? "Creating…" : "Create plan"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SQ.card },
  // a modal sheet starts below the notch, so insets.top does not apply here
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: SQ.rule,
  },
  cancel: { fontFamily: Font.sans, fontSize: 13, color: SQ.muted },
  headerSpacer: { width: 42 },
  heading: {
    fontFamily: Font.sansBold,
    fontSize: 20,
    letterSpacing: -0.4,
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
    ...Type.label,
    width: 54,
    fontSize: 10,
    color: SQ.faint,
  },
  rowControl: { flex: 1, alignItems: "flex-start" },
  rowValue: {
    flex: 1,
    fontFamily: Font.sansMedium,
    fontSize: 14,
    color: SQ.ink,
  },
  rowInput: {
    flex: 1,
    padding: 0,
    fontFamily: Font.sansMedium,
    fontSize: 14,
    color: SQ.ink,
  },

  options: {
    borderWidth: 1,
    borderColor: SQ.line,
    borderRadius: 13,
    padding: 5,
    marginBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  optionOn: { backgroundColor: SQ.fill },
  optionBody: { flex: 1 },
  optionName: { fontFamily: Font.sansSemibold, fontSize: 14, color: SQ.ink },
  optionHint: {
    fontFamily: Font.sans,
    fontSize: 10.5,
    color: SQ.faint,
    marginTop: 2,
  },
  optionEmpty: {
    fontFamily: Font.sans,
    fontSize: 11,
    lineHeight: 16,
    color: SQ.faint,
    paddingHorizontal: 11,
    paddingTop: 2,
    paddingBottom: 8,
  },
  caution: {
    fontFamily: Font.sans,
    fontSize: 11,
    color: SQ.danger,
    paddingTop: 2,
    paddingBottom: 6,
  },

  note: {
    paddingHorizontal: 24,
    paddingTop: 8,
    fontFamily: Font.sans,
    fontSize: 14,
    lineHeight: 22,
    color: SQ.text,
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
