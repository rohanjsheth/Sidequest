import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Font, SQ } from "@/constants/sidequest";
import { api, ApiError } from "@/lib/api";

type FriendUser = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  phone: string;
};

type FriendshipRow = {
  friendshipId: string;
  user: FriendUser;
};

type FriendsResponse = { friends: FriendshipRow[] };
type RequestsResponse = { requests: FriendshipRow[] };

type Person = {
  name: string;
  sub: string;
  id: string;
  hosting?: boolean;
};

const COLORS = [
  "#A0A0A0",
  "#8A9BA8",
  "#B0A48F",
  "#7E8C99",
  "#9AA497",
  "#C2897A",
];
const colorFor = (id: string) =>
  COLORS[id.charCodeAt(id.length - 1) % COLORS.length];

function personFromRow(row: FriendshipRow): Person {
  return {
    id: row.friendshipId,
    name: row.user.name ?? "Friend",
    sub: row.user.phone,
  };
}

function normalizeUSPhone(text: string) {
  let digits = text.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function formatUSPhone(digits: string) {
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 10);
  if (!digits) return "";
  if (digits.length < 4) return `(${a}`;
  if (digits.length < 7) return `(${a}) ${b}`;
  return `(${a}) ${b}-${c}`;
}

export default function Friends() {
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<Person[]>([]);
  const [friendReq, setFriendReq] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [phone, setPhone] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  const canRequest = phone.length === 10 && !sendingRequest;

  const loadFriends = useCallback(async () => {
    setLoading(true);
    try {
      const [{ friends }, { requests }] = await Promise.all([
        api<FriendsResponse>("/friends", { auth: true }),
        api<RequestsResponse>("/friends/requests", { auth: true }),
      ]);
      setFriends(friends.map(personFromRow));
      setFriendReq(requests.map(personFromRow));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFriends();
    }, [loadFriends]),
  );

  async function accept(id: string) {
    setError(null);
    try {
      await api(`/friends/${id}/accept`, { method: "POST", auth: true });
      await loadFriends();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }
  async function decline(id: string) {
    setError(null);
    try {
      await api(`/friends/${id}/decline`, { method: "POST", auth: true });
      await loadFriends();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  async function sendFriendRequest() {
    if (!canRequest) return;

    setError(null);
    setNotice(null);
    setSendingRequest(true);
    try {
      await api("/friends/request", {
        method: "POST",
        body: { phone },
        auth: true,
      });
      setPhone("");
      setAdding(false);
      setNotice("Friend request sent.");
      await loadFriends();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSendingRequest(false);
    }
  }

  function toggleAdding() {
    setAdding((open) => !open);
    setPhone("");
    setError(null);
    setNotice(null);
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.title}>Friends</Text>
        <Pressable style={styles.addBtn} onPress={toggleAdding}>
          <Feather name={adding ? "x" : "plus"} size={22} color={SQ.card} />
        </Pressable>
      </View>

      {adding ? (
        <View style={styles.addPanel}>
          <View style={styles.addInputWrap}>
            <Text style={styles.addLabel}>PHONE</Text>
            <TextInput
              value={formatUSPhone(phone)}
              onChangeText={(value) => setPhone(normalizeUSPhone(value))}
              placeholder="(415) 555-0134"
              placeholderTextColor={SQ.ghost}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              returnKeyType="send"
              onSubmitEditing={sendFriendRequest}
              style={styles.addInput}
              autoFocus
            />
          </View>
          <Pressable
            style={[styles.send, !canRequest && styles.sendOff]}
            onPress={sendFriendRequest}
            disabled={!canRequest}>
            <Text style={styles.sendText}>
              {sendingRequest ? "Sending..." : "Send"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {loading ? <Text style={styles.state}>Loading friends...</Text> : null}

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.eyebrow}>REQUESTS · {friendReq.length}</Text>
        {friendReq.length === 0 ? (
          <Text style={styles.empty}>No pending requests.</Text>
        ) : (
          friendReq.map((p) => (
            <View key={p.id} style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: colorFor(p.id) }]}>
                <Text style={styles.avatarText}>{p.name[0]}</Text>
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.sub}>{p.sub}</Text>
              </View>
              <Pressable style={styles.accept} onPress={() => accept(p.id)}>
                <Text style={styles.acceptText}>Accept</Text>
              </Pressable>
              <Pressable style={styles.decline} onPress={() => decline(p.id)}>
                <Feather name="x" size={15} color="#AAAAAA" />
              </Pressable>
            </View>
          ))
        )}

        <Text style={[styles.eyebrow, styles.eyebrowDivider]}>
          ALL FRIENDS · {friends.length}
        </Text>
        {friends.length === 0 ? (
          <Text style={styles.empty}>No friends yet.</Text>
        ) : (
          friends.map((p) => (
            <View key={p.id} style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: colorFor(p.id) }]}>
                <Text style={styles.avatarText}>{p.name[0]}</Text>
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.name}>{p.name}</Text>
                <View style={styles.subRow}>
                  {p.hosting ? <View style={styles.dot} /> : null}
                  <Text style={[styles.sub, p.hosting && styles.subHosting]}>
                    {p.sub}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SQ.card },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  title: {
    fontFamily: Font.sansBold,
    fontSize: 32,
    letterSpacing: -0.6,
    color: SQ.ink,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SQ.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  addPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  addInputWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: SQ.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 9,
  },
  addLabel: {
    fontFamily: Font.mono,
    fontSize: 9,
    letterSpacing: 1.3,
    color: SQ.faint,
  },
  addInput: {
    fontFamily: Font.monoMedium,
    fontSize: 16,
    color: SQ.ink,
    padding: 0,
    marginTop: 4,
  },
  send: {
    backgroundColor: SQ.ink,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  sendOff: { opacity: 0.35 },
  sendText: { fontFamily: Font.sansSemibold, fontSize: 13, color: SQ.card },
  error: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: "#B3261E",
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  notice: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: SQ.ink,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  state: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: SQ.faint,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  empty: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: SQ.faint,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },

  eyebrow: {
    fontFamily: Font.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: SQ.faint,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  eyebrowDivider: {
    borderTopWidth: 1,
    borderTopColor: SQ.hair,
    marginTop: 8,
    paddingTop: 18,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: Font.sansSemibold, fontSize: 15, color: SQ.card },
  rowBody: { flex: 1, minWidth: 0 },
  name: { fontFamily: Font.sansSemibold, fontSize: 15, color: SQ.ink },
  sub: { fontFamily: Font.mono, fontSize: 10.5, color: SQ.faint, marginTop: 2 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  subHosting: { color: SQ.ink, marginTop: 0 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: SQ.ink },

  accept: {
    backgroundColor: SQ.ink,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  acceptText: { fontFamily: Font.sansBold, fontSize: 11, color: SQ.card },
  decline: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SQ.line,
    alignItems: "center",
    justifyContent: "center",
  },
});
