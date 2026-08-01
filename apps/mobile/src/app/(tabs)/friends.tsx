import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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

import { Font, SQ } from "@/constants/sidequest";
import { api, ApiError } from "@/lib/api";
import { ColorBlurBackground } from "@/components/color-blur-bg";
import { PersonRow } from "@/components/person-row";
import { SkeletonChip, SkeletonPersonRow } from "@/components/skeleton";
import { displayPhone, formatUSPhone, normalizeUSPhone } from "@/lib/phone";

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

type FriendList = { id: string; name: string; memberCount: number };
type ListsResponse = { lists: FriendList[] };

type Person = {
  name: string;
  sub: string;
  id: string;
  userId: string;
  hosting?: boolean;
};

function personFromRow(row: FriendshipRow): Person {
  return {
    id: row.friendshipId,
    userId: row.user.id,
    name: row.user.name ?? "Friend",
    sub: displayPhone(row.user.phone),
  };
}

export default function Friends() {
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<Person[] | null>(null);
  const [friendReq, setFriendReq] = useState<Person[] | null>(null);
  const [lists, setLists] = useState<FriendList[] | null>(null);
  const [newListName, setNewListName] = useState("");
  const [namingList, setNamingList] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [phone, setPhone] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  const canRequest = phone.length === 10 && !sendingRequest;

  const loadFriends = useCallback(async () => {
    try {
      const [{ friends }, { requests }, { lists }] = await Promise.all([
        api<FriendsResponse>("/friends", { auth: true }),
        api<RequestsResponse>("/friends/requests", { auth: true }),
        api<ListsResponse>("/lists", { auth: true }),
      ]);
      setFriends(friends.map(personFromRow));
      setFriendReq(requests.map(personFromRow));
      setLists(lists);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
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

  async function removeFriend(p: Person) {
    setError(null);
    try {
      await api(`/friends/${p.id}`, { method: "DELETE", auth: true });
      await loadFriends();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  async function blockFriend(p: Person) {
    setError(null);
    try {
      await api(`/blocks/${p.userId}`, { method: "POST", auth: true });
      await loadFriends();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  function openFriendMenu(p: Person) {
    Alert.alert(
      p.name,
      "Remove unfriends them. Block also hides each other's plans and stops re-adding.",
      [
        { text: "Block", style: "destructive", onPress: () => blockFriend(p) },
        {
          text: "Remove friend",
          style: "destructive",
          onPress: () => removeFriend(p),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
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

  async function createList() {
    const trimmed = newListName.trim();
    if (trimmed === "" || creatingList) return;

    setError(null);
    setCreatingList(true);
    try {
      const { list } = await api<{ list: { id: string } }>("/lists", {
        method: "POST",
        body: { name: trimmed },
        auth: true,
      });
      setNewListName("");
      setNamingList(false);
      router.push(`/list/${list.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setCreatingList(false);
    }
  }

  function toggleNamingList() {
    setNamingList((open) => !open);
    setNewListName("");
    setError(null);
  }

  function toggleAdding() {
    setAdding((open) => !open);
    setPhone("");
    setError(null);
    setNotice(null);
  }

  return (
    <ColorBlurBackground>
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
                style={styles.addInput}
                autoFocus
              />
            </View>
            <Pressable
              style={[styles.send, !canRequest && styles.sendOff]}
              onPress={sendFriendRequest}
              disabled={!canRequest}
            >
              <Text style={styles.sendText}>
                {sendingRequest ? "Sending..." : "Send"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={styles.eyebrow}>
            LISTS{lists ? ` · ${lists.length}` : ""}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.strip}
          >
            {lists === null ? (
              <>
                <SkeletonChip />
                <SkeletonChip width={92} />
              </>
            ) : (
              <>
                {lists.map((l) => (
                  <Pressable
                    key={l.id}
                    style={styles.chip}
                    onPress={() => router.push(`/list/${l.id}`)}
                  >
                    <Text style={styles.chipName}>{l.name}</Text>
                    <Text style={styles.chipCount}>{l.memberCount}</Text>
                  </Pressable>
                ))}
                <Pressable
                  style={[styles.chip, styles.chipNew]}
                  onPress={toggleNamingList}
                >
                  <Feather
                    name={namingList ? "x" : "plus"}
                    size={13}
                    color={SQ.muted}
                  />
                  <Text style={styles.chipNewText}>New list</Text>
                </Pressable>
              </>
            )}
          </ScrollView>

          {namingList ? (
            <View style={styles.addPanel}>
              <View style={styles.addInputWrap}>
                <Text style={styles.addLabel}>LIST NAME</Text>
                <TextInput
                  value={newListName}
                  onChangeText={setNewListName}
                  placeholder="Close friends"
                  placeholderTextColor={SQ.ghost}
                  style={styles.addInput}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={createList}
                />
              </View>
              <Pressable
                style={[
                  styles.send,
                  (newListName.trim() === "" || creatingList) && styles.sendOff,
                ]}
                onPress={createList}
                disabled={newListName.trim() === "" || creatingList}
              >
                <Text style={styles.sendText}>
                  {creatingList ? "Creating..." : "Create"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={[styles.eyebrow, styles.eyebrowDivider]}>
            REQUESTS{friendReq ? ` · ${friendReq.length}` : ""}
          </Text>
          {friendReq === null ? (
            <SkeletonPersonRow />
          ) : friendReq.length === 0 ? (
            <Text style={styles.empty}>No pending requests.</Text>
          ) : (
            friendReq.map((p) => (
              <PersonRow key={p.id} seed={p.userId} name={p.name} sub={p.sub}>
                <Pressable style={styles.accept} onPress={() => accept(p.id)}>
                  <Text style={styles.acceptText}>Accept</Text>
                </Pressable>
                <Pressable style={styles.decline} onPress={() => decline(p.id)}>
                  <Feather name="x" size={15} color={SQ.ghost} />
                </Pressable>
              </PersonRow>
            ))
          )}

          <Text style={[styles.eyebrow, styles.eyebrowDivider]}>
            ALL FRIENDS{friends ? ` · ${friends.length}` : ""}
          </Text>
          {friends === null ? (
            <>
              <SkeletonPersonRow />
              <SkeletonPersonRow />
              <SkeletonPersonRow />
            </>
          ) : friends.length === 0 ? (
            <Text style={styles.empty}>No friends yet.</Text>
          ) : (
            friends.map((p) => (
              <PersonRow
                key={p.id}
                seed={p.userId}
                name={p.name}
                sub={p.sub}
                accent={p.hosting}
              >
                <Pressable
                  style={styles.menuBtn}
                  onPress={() => openFriendMenu(p)}
                  hitSlop={8}
                >
                  <Feather name="more-horizontal" size={18} color={SQ.faint} />
                </Pressable>
              </PersonRow>
            ))
          )}
        </ScrollView>
      </View>
    </ColorBlurBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
    paddingTop: 14,
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
    color: SQ.danger,
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
    borderTopColor: SQ.rule,
    marginTop: 8,
    paddingTop: 18,
  },

  strip: { paddingHorizontal: 24, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: SQ.card,
    borderWidth: 1,
    borderColor: SQ.line,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipName: { fontFamily: Font.sansSemibold, fontSize: 13, color: SQ.ink },
  chipCount: { fontFamily: Font.mono, fontSize: 11, color: SQ.faint },
  chipNew: { backgroundColor: "transparent", borderStyle: "dashed", gap: 6 },
  chipNewText: { fontFamily: Font.sansMedium, fontSize: 13, color: SQ.muted },

  menuBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

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
