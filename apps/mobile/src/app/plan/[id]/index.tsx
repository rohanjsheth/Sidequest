import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, ApiError } from "@/lib/api";
import { detailedCountdown, formatWhen } from "@/lib/countdown";
import { useSession } from "@/lib/session";
import { Font, SQ } from "@/constants/sidequest";
import { avatarColor } from "@/lib/avatar";
import { ColorBlurBackground } from "@/components/color-blur-bg";
import { FlapRow } from "@/components/flap-tile";

const WEB_BASE = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:3001";

type Person = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

type Plan = {
  id: string;
  title: string;
  location: string;
  description: string | null;
  startsAt: string;
  cancelled: boolean;
  host: Person;
  going: number;
  shareToken: string;
  audienceList: { id: string; name: string } | null;
  myRsvp: "invited" | "going" | "declined" | null;
};
type Attendee = { id: string; name: string; isHost: boolean };
type ApiAttendee = {
  user: Person;
  status: string;
  isHost: boolean;
};
type Rsvp = "going" | "declined";

const RSVPS: { key: Rsvp; label: string }[] = [
  { key: "going", label: "Going" },
  { key: "declined", label: "Can't" },
];

export default function Plan() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [rsvp, setRsvp] = useState<Rsvp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingRsvp, setSavingRsvp] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPlan = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const [{ event }, { attendees: rows }] = await Promise.all([
          api<{ event: Plan }>(`/events/${id}`, { auth: true }),
          api<{ attendees: ApiAttendee[] }>(`/events/${id}/attendees`, {
            auth: true,
          }),
        ]);
        setPlan(event);
        // "invited" is not an answer — only an explicit going/declined lights a button
        setRsvp(
          event.myRsvp === "going" || event.myRsvp === "declined"
            ? event.myRsvp
            : null,
        );
        setAttendees(
          rows.map((row) => ({
            id: row.user.id,
            name: row.user.name ?? "Someone",
            isHost: row.isHost,
          })),
        );
        setError(null);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Something went wrong",
        );
      } finally {
        // always clears — `showLoading` only controls whether we flash the
        // loading state on the way in
        setLoading(false);
      }
    },
    [id],
  );

  // refetch on focus so edits made on /edit are reflected when we come back
  useFocusEffect(
    useCallback(() => {
      void loadPlan(false);
    }, [loadPlan]),
  );

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 2200);
  }

  if (!plan) {
    return (
      <ColorBlurBackground>
        <View style={styles.screen}>
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.headerBtn}>‹ back</Text>
            </Pressable>
          </View>
          <Text style={styles.state}>
            {loading ? "Loading plan..." : (error ?? "Could not load plan.")}
          </Text>
        </View>
      </ColorBlurBackground>
    );
  }

  const hostName = plan.host.name ?? "Someone";
  const isHost = user?.id === plan.host.id;
  const countdown = detailedCountdown(plan.startsAt);

  async function choose(status: Rsvp) {
    if (savingRsvp) return;

    const previous = rsvp;
    setRsvp(status);
    setError(null);
    setSavingRsvp(true);
    try {
      await api(`/events/${id}/rsvp`, {
        method: "POST",
        body: { status },
        auth: true,
      });
      await loadPlan(false);
      showToast(status === "going" ? "You're going" : "Marked can't go");
    } catch (err) {
      setRsvp(previous);
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSavingRsvp(false);
    }
  }

  async function sharePlan() {
    if (sharing || !plan) return;

    setSharing(true);
    try {
      const url = `${WEB_BASE.replace(/\/$/, "")}/p/${plan.shareToken}`;
      await Share.share({
        title: plan.title,
        message: `Join my sidequest: ${plan.title}\n${url}`,
      });
    } finally {
      setSharing(false);
    }
  }

  function confirmBlock() {
    Alert.alert(
      `Block ${hostName}?`,
      "You won't see each other's plans, and they're removed as a friend.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Block", style: "destructive", onPress: blockHost },
      ],
    );
  }

  async function blockHost() {
    if (blocking || !plan) return;

    setBlocking(true);
    try {
      await api(`/blocks/${plan.host.id}`, { method: "POST", auth: true });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setBlocking(false);
    }
  }

  function openPlanMenu() {
    Alert.alert(hostName, undefined, [
      { text: "Report plan", style: "destructive", onPress: openReport },
      { text: "Block host", style: "destructive", onPress: confirmBlock },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function openReport() {
    if (!plan) return;
    router.push({
      pathname: "/report/[id]",
      params: { id: plan.id, title: plan.title },
    });
  }

  return (
    <ColorBlurBackground>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        >
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.headerBtn}>‹ back</Text>
            </Pressable>
            {isHost ? (
              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => router.push(`/plan/${plan.id}/edit`)}
                  hitSlop={8}
                >
                  <Text style={styles.headerBtn}>edit</Text>
                </Pressable>
                <Pressable onPress={sharePlan} disabled={sharing} hitSlop={8}>
                  <Text
                    style={[styles.headerBtn, sharing && styles.headerBtnOff]}
                  >
                    {sharing ? "sharing..." : "share ↗"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={openPlanMenu} hitSlop={8}>
                <Feather name="more-horizontal" size={18} color={SQ.muted} />
              </Pressable>
            )}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.intro}>
            <View style={[styles.pill, plan.cancelled && styles.pillCancelled]}>
              <Text style={styles.pillText}>
                {plan.cancelled ? "CANCELLED" : countdown.pill}
              </Text>
            </View>
            <Text style={styles.title}>{plan.title}</Text>
            <View style={styles.hostRow}>
              <View
                style={[
                  styles.hostAvatar,
                  { backgroundColor: avatarColor(plan.host.id).bg },
                ]}
              >
                <Text
                  style={[
                    styles.hostAvatarText,
                    { color: avatarColor(plan.host.id).fg },
                  ]}
                >
                  {hostName[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.hostText}>Hosted by {hostName}</Text>
            </View>
          </View>

          {plan.cancelled ? null : (
            <View style={styles.countdown}>
              <Text style={styles.inLabel}>IN</Text>
              {countdown.units.map((unit, index) => (
                <Fragment key={unit.label}>
                  {index > 0 ? <Text style={styles.colon}>:</Text> : null}
                  <View style={styles.cdUnit}>
                    <FlapRow chars={[...unit.value]} size="lg" />
                    <Text style={styles.cdUnitLabel}>{unit.label}</Text>
                  </View>
                </Fragment>
              ))}
            </View>
          )}

          <View style={styles.goingCard}>
            <Text style={styles.goingLabel}>{plan.going} GOING</Text>
            <View style={styles.attendees}>
              {attendees.map((a) => (
                <View key={a.id} style={styles.attendee}>
                  <View
                    style={[
                      styles.attAvatar,
                      { backgroundColor: avatarColor(a.id).bg },
                      a.isHost && styles.attAvatarHost,
                    ]}
                  >
                    <Text
                      style={[
                        styles.attAvatarText,
                        { color: avatarColor(a.id).fg },
                      ]}
                    >
                      {a.name[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.attName} numberOfLines={1}>
                    {a.name}
                  </Text>
                  {a.isHost ? <Text style={styles.attHost}>HOST</Text> : null}
                </View>
              ))}
            </View>
            {plan.audienceList ? (
              <Text style={styles.audience}>
                Sent to {plan.audienceList.name}
              </Text>
            ) : null}
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Feather name="clock" size={15} color={SQ.faint} />
              <Text style={styles.detailText}>{formatWhen(plan.startsAt)}</Text>
            </View>
            <View style={[styles.detailRow, styles.detailLast]}>
              <Feather name="map-pin" size={15} color={SQ.faint} />
              <Text style={styles.detailText}>{plan.location}</Text>
            </View>
          </View>

          {plan.description ? (
            <Text style={styles.description}>{plan.description}</Text>
          ) : null}
        </ScrollView>

        {!isHost && !plan.cancelled ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
            {toast ? (
              <View style={styles.toast}>
                <Text style={styles.toastText}>{toast}</Text>
              </View>
            ) : null}
            <View style={styles.rsvpBar}>
              {RSVPS.map((r, i) => (
                <Pressable
                  key={r.key}
                  onPress={() => choose(r.key)}
                  disabled={savingRsvp}
                  style={[
                    styles.rsvpBtn,
                    i > 0 && styles.rsvpDivider,
                    rsvp === r.key && styles.rsvpActive,
                    savingRsvp && styles.rsvpOff,
                  ]}
                >
                  <Text
                    style={[
                      styles.rsvpText,
                      rsvp === r.key && styles.rsvpTextActive,
                    ]}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </ColorBlurBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  headerActions: { flexDirection: "row", gap: 18 },
  headerBtn: { fontFamily: Font.mono, fontSize: 12.5, color: SQ.muted },
  headerBtnOff: { color: SQ.ghost },
  state: {
    fontFamily: Font.mono,
    fontSize: 12.5,
    color: SQ.faint,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  error: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: SQ.danger,
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  intro: { paddingHorizontal: 24, paddingTop: 6 },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: SQ.ink,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillCancelled: { backgroundColor: SQ.danger },
  pillText: {
    fontFamily: Font.monoSemibold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: SQ.card,
  },
  title: {
    fontFamily: Font.sansBold,
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.5,
    color: SQ.ink,
    marginTop: 14,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 12,
  },
  hostAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: SQ.line,
    alignItems: "center",
    justifyContent: "center",
  },
  hostAvatarText: { fontFamily: Font.mono, fontSize: 9 },
  hostText: { fontFamily: Font.mono, fontSize: 12, color: SQ.muted },

  countdown: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  inLabel: {
    fontFamily: Font.monoBold,
    fontSize: 15,
    letterSpacing: 2,
    color: SQ.ink,
    height: 42,
    lineHeight: 42,
  },
  cdUnit: { alignItems: "center", gap: 7 },
  cdUnitLabel: {
    fontFamily: Font.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    color: SQ.faint,
  },
  colon: {
    fontFamily: Font.monoBold,
    fontSize: 20,
    color: SQ.ghost,
    height: 42,
    lineHeight: 42,
  },

  goingCard: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: SQ.fill,
    borderWidth: 1,
    borderColor: SQ.rule,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 18,
  },
  goingLabel: {
    fontFamily: Font.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: SQ.faint,
    marginBottom: 15,
    paddingHorizontal: 2,
  },
  attendees: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  audience: {
    fontFamily: Font.mono,
    fontSize: 10.5,
    color: SQ.faint,
    marginTop: 16,
    paddingTop: 12,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: SQ.line,
  },
  attendee: { width: 64, alignItems: "center", gap: 6 },
  attAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: SQ.line,
    alignItems: "center",
    justifyContent: "center",
  },
  attAvatarHost: {
    borderWidth: 3.5,
    borderColor: SQ.ink,
  },
  attAvatarText: {
    fontFamily: Font.sansSemibold,
    fontSize: 15,
  },
  attName: {
    fontFamily: Font.mono,
    fontSize: 10.5,
    color: SQ.text,
    maxWidth: "100%",
  },
  attHost: {
    fontFamily: Font.monoBold,
    fontSize: 8,
    letterSpacing: 1,
    color: SQ.ink,
    marginTop: -3,
  },

  details: { paddingHorizontal: 24, paddingTop: 16 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: SQ.rule,
  },
  detailLast: { borderBottomWidth: 0 },
  detailText: {
    flex: 1,
    fontFamily: Font.mono,
    fontSize: 12.5,
    color: SQ.ink,
  },

  description: {
    paddingHorizontal: 24,
    paddingTop: 20,
    fontFamily: Font.sans,
    fontSize: 15,
    lineHeight: 24,
    color: SQ.text,
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SQ.card,
    borderTopWidth: 1,
    borderTopColor: SQ.line,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  toast: {
    alignSelf: "center",
    backgroundColor: SQ.ink,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
  },
  toastText: {
    fontFamily: Font.sansSemibold,
    fontSize: 12,
    color: SQ.card,
  },
  rsvpBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: SQ.ink,
    borderRadius: 11,
    overflow: "hidden",
  },
  rsvpBtn: { flex: 1, alignItems: "center", paddingVertical: 14 },
  rsvpDivider: { borderLeftWidth: 1, borderLeftColor: SQ.line },
  rsvpActive: { backgroundColor: SQ.ink },
  rsvpOff: { opacity: 0.45 },
  rsvpText: { fontFamily: Font.monoSemibold, fontSize: 13, color: SQ.ink },
  rsvpTextActive: { color: SQ.card },
});
