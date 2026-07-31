import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
import { avatarColor } from "@/lib/avatar";

type Member = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  phone: string;
};

type ListResponse = {
  list: { id: string; name: string };
  members: Member[];
};
type FriendsResponse = {
  friends: { friendshipId: string; user: Member }[];
};

export default function ListDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [name, setName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [friends, setFriends] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const memberIds = new Set(members.map((m) => m.id));
  const candidates = friends.filter((f) => !memberIds.has(f.id));

  const load = useCallback(async () => {
    try {
      const [listRes, friendsRes] = await Promise.all([
        api<ListResponse>(`/lists/${id}`, { auth: true }),
        api<FriendsResponse>("/friends", { auth: true }),
      ]);
      setName(listRes.list.name);
      setMembers(listRes.members);
      setFriends(friendsRes.friends.map((f) => f.user));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function mutate(fn: () => Promise<unknown>, memberId: string) {
    if (busyId) return;
    setError(null);
    setBusyId(memberId);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  function addMember(m: Member) {
    void mutate(
      () =>
        api(`/lists/${id}/members`, {
          method: "POST",
          body: { friendId: m.id },
          auth: true,
        }),
      m.id,
    );
  }

  function removeMember(m: Member) {
    void mutate(
      () =>
        api(`/lists/${id}/members/${m.id}`, { method: "DELETE", auth: true }),
      m.id,
    );
  }

  function startRename() {
    setDraftName(name);
    setRenaming(true);
  }

  async function saveRename() {
    const trimmed = draftName.trim();
    if (trimmed === "" || trimmed === name) {
      setRenaming(false);
      return;
    }
    setError(null);
    try {
      await api(`/lists/${id}`, {
        method: "PATCH",
        body: { name: trimmed },
        auth: true,
      });
      setName(trimmed);
      setRenaming(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  function confirmDelete() {
    Alert.alert(
      `Delete "${name}"?`,
      "Plans you already sent to this list stay put — they just stop showing a list name.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api(`/lists/${id}`, { method: "DELETE", auth: true });
              router.back();
            } catch (err) {
              setError(
                err instanceof ApiError ? err.message : "Something went wrong",
              );
            }
          },
        },
      ],
    );
  }

  return (
    <ColorBlurBackground>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Feather name="chevron-left" size={24} color={SQ.ink} />
          </Pressable>
          <Pressable onPress={confirmDelete} hitSlop={10}>
            <Text style={styles.delete}>Delete</Text>
          </Pressable>
        </View>

        <View style={styles.titleWrap}>
          {renaming ? (
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              style={[styles.title, styles.titleInput]}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveRename}
              onBlur={saveRename}
            />
          ) : (
            <Pressable onPress={startRename}>
              <Text style={styles.title}>{name || " "}</Text>
            </Pressable>
          )}
          <Text style={styles.subtitle}>
            {members.length === 0
              ? "Nobody yet — plans sent here reach no one"
              : `${members.length} ${members.length === 1 ? "person" : "people"} get plans sent here`}
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <Text style={styles.state}>Loading...</Text> : null}

        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <Text style={styles.eyebrow}>IN THIS LIST · {members.length}</Text>
          {members.length === 0 ? (
            <Text style={styles.empty}>Add friends below.</Text>
          ) : (
            members.map((m) => (
              <PersonRow
                key={m.id}
                person={m}
                icon="minus"
                busy={busyId === m.id}
                onPress={() => removeMember(m)}
              />
            ))
          )}

          <Text style={[styles.eyebrow, styles.eyebrowDivider]}>
            ADD FRIENDS · {candidates.length}
          </Text>
          {candidates.length === 0 ? (
            <Text style={styles.empty}>
              {friends.length === 0
                ? "No friends yet."
                : "Everyone's already in."}
            </Text>
          ) : (
            candidates.map((f) => (
              <PersonRow
                key={f.id}
                person={f}
                icon="plus"
                busy={busyId === f.id}
                onPress={() => addMember(f)}
              />
            ))
          )}
        </ScrollView>
      </View>
    </ColorBlurBackground>
  );
}

function PersonRow({
  person,
  icon,
  busy,
  onPress,
}: {
  person: Member;
  icon: "plus" | "minus";
  busy: boolean;
  onPress: () => void;
}) {
  const label = person.name ?? "Friend";
  const color = avatarColor(person.id);
  return (
    <View style={[styles.row, busy && styles.rowBusy]}>
      <View style={[styles.avatar, { backgroundColor: color.bg }]}>
        <Text style={[styles.avatarText, { color: color.fg }]}>{label[0]}</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.name}>{label}</Text>
        <Text style={styles.sub}>{person.phone}</Text>
      </View>
      <Pressable
        style={[styles.action, icon === "plus" && styles.actionAdd]}
        onPress={onPress}
        disabled={busy}
        hitSlop={8}
      >
        <Feather
          name={icon}
          size={16}
          color={icon === "plus" ? SQ.card : SQ.faint}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 6,
  },
  delete: { fontFamily: Font.sansMedium, fontSize: 13, color: "#B3261E" },

  titleWrap: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  title: {
    fontFamily: Font.sansBold,
    fontSize: 32,
    letterSpacing: -0.6,
    color: SQ.ink,
  },
  titleInput: {
    padding: 0,
    borderBottomWidth: 2,
    borderBottomColor: SQ.ink,
  },
  subtitle: {
    fontFamily: Font.mono,
    fontSize: 11,
    color: SQ.faint,
    marginTop: 6,
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
  rowBusy: { opacity: 0.4 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: SQ.line,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: Font.sansSemibold, fontSize: 15, color: SQ.ink },
  rowBody: { flex: 1, minWidth: 0 },
  name: { fontFamily: Font.sansSemibold, fontSize: 15, color: SQ.ink },
  sub: { fontFamily: Font.mono, fontSize: 10.5, color: SQ.faint, marginTop: 2 },

  action: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SQ.line,
    alignItems: "center",
    justifyContent: "center",
  },
  actionAdd: { backgroundColor: SQ.ink, borderColor: SQ.ink },
});
