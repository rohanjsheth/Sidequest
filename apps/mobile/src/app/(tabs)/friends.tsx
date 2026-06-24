import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

export default function Friends() {
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<Person[]>([]);
  const [friendReq, setFriendReq] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.title}>Friends</Text>
        <Pressable style={styles.addBtn}>
          {/* TODO(you): add-friend flow (by phone / contact picker) */}
          <Feather name="plus" size={22} color={SQ.card} />
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text style={styles.state}>Loading friends...</Text> : null}

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.eyebrow}>REQUESTS · {friendReq.length}</Text>
        {friendReq.map((p) => (
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
        ))}

        <Text style={[styles.eyebrow, styles.eyebrowDivider]}>
          ALL FRIENDS · {friends.length}
        </Text>
        {friends.map((p) => (
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
        ))}
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
  error: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: "#B3261E",
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
