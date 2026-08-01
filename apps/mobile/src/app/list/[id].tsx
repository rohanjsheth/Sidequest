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
import { PersonRow } from "@/components/person-row";
import { Skeleton, SkeletonPersonRow } from "@/components/skeleton";
import { displayPhone } from "@/lib/phone";

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

  const [name, setName] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [friends, setFriends] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [staged, setStaged] = useState<string[]>([]);
  const [committing, setCommitting] = useState(false);

  const memberIds = new Set((members ?? []).map((m) => m.id));
  const candidates = (friends ?? []).filter((f) => !memberIds.has(f.id));

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
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function toggleStaged(memberId: string) {
    setStaged((current) =>
      current.includes(memberId)
        ? current.filter((s) => s !== memberId)
        : [...current, memberId],
    );
  }

  async function commitAdds() {
    if (staged.length === 0 || committing) return;
    setError(null);
    setCommitting(true);

    const results = await Promise.allSettled(
      staged.map((friendId) =>
        api(`/lists/${id}/members`, {
          method: "POST",
          body: { friendId },
          auth: true,
        }),
      ),
    );

    // 409 means they were already in the list — same end state, not a failure
    const failed = results.filter(
      (r) =>
        r.status === "rejected" &&
        !(r.reason instanceof ApiError && r.reason.status === 409),
    );
    if (failed.length > 0) {
      setError(
        failed.length === staged.length
          ? "Couldn't add them. Try again."
          : `Couldn't add ${failed.length} of them.`,
      );
    }

    setStaged([]);
    await load();
    setCommitting(false);
  }

  async function removeMember(m: Member) {
    const previous = members;
    setMembers((current) => (current ?? []).filter((x) => x.id !== m.id));
    setError(null);
    try {
      await api(`/lists/${id}/members/${m.id}`, {
        method: "DELETE",
        auth: true,
      });
    } catch (err) {
      setMembers(previous);
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  function startRename() {
    setDraftName(name ?? "");
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
      `Delete "${name ?? "this list"}"?`,
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

  const count = members?.length ?? 0;

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
          {name === null ? (
            <Skeleton width={190} height={30} radius={8} />
          ) : renaming ? (
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
              <Text style={styles.title}>{name}</Text>
            </Pressable>
          )}
          <Text style={styles.subtitle}>
            {members === null
              ? " "
              : count === 0
                ? "Nobody yet — plans sent here reach no one"
                : `${count} ${count === 1 ? "person" : "people"} get plans sent here`}
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={styles.eyebrow}>
            IN THIS LIST{members ? ` · ${count}` : ""}
          </Text>
          {members === null ? (
            <>
              <SkeletonPersonRow />
              <SkeletonPersonRow />
            </>
          ) : count === 0 ? (
            <Text style={styles.empty}>Add friends below.</Text>
          ) : (
            members.map((m) => (
              <MemberRow
                key={m.id}
                person={m}
                icon="minus"
                onPress={() => removeMember(m)}
              />
            ))
          )}

          <Text style={[styles.eyebrow, styles.eyebrowDivider]}>
            ADD FRIENDS{friends ? ` · ${candidates.length}` : ""}
          </Text>
          {friends === null ? (
            <>
              <SkeletonPersonRow />
              <SkeletonPersonRow />
              <SkeletonPersonRow />
            </>
          ) : candidates.length === 0 ? (
            <Text style={styles.empty}>
              {friends.length === 0
                ? "No friends yet."
                : "Everyone's already in."}
            </Text>
          ) : (
            candidates.map((f) => (
              <MemberRow
                key={f.id}
                person={f}
                icon={staged.includes(f.id) ? "check" : "plus"}
                selected={staged.includes(f.id)}
                onPress={() => toggleStaged(f.id)}
              />
            ))
          )}
        </ScrollView>

        {staged.length > 0 ? (
          <View
            style={[styles.commitBar, { paddingBottom: insets.bottom + 14 }]}
          >
            <Pressable
              style={[styles.commit, committing && styles.commitOff]}
              onPress={commitAdds}
              disabled={committing}
            >
              <Text style={styles.commitText}>
                {committing ? "Adding..." : `Add ${staged.length} to list`}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </ColorBlurBackground>
  );
}

function MemberRow({
  person,
  icon,
  selected = false,
  onPress,
}: {
  person: Member;
  icon: "plus" | "minus" | "check";
  selected?: boolean;
  onPress: () => void;
}) {
  const filled = icon !== "minus";
  return (
    <PersonRow
      seed={person.id}
      name={person.name ?? "Friend"}
      sub={displayPhone(person.phone)}
      style={selected ? styles.rowStaged : undefined}
    >
      <Pressable
        style={[styles.action, filled && styles.actionAdd]}
        onPress={onPress}
        hitSlop={8}
      >
        <Feather name={icon} size={16} color={filled ? SQ.card : SQ.faint} />
      </Pressable>
    </PersonRow>
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
  delete: { fontFamily: Font.sansMedium, fontSize: 13, color: SQ.danger },

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
    color: SQ.danger,
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

  rowStaged: { backgroundColor: SQ.fill },

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

  commitBar: {
    borderTopWidth: 1,
    borderTopColor: SQ.line,
    backgroundColor: SQ.card,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  commit: {
    backgroundColor: SQ.ink,
    borderRadius: 13,
    alignItems: "center",
    paddingVertical: 16,
  },
  commitOff: { opacity: 0.35 },
  commitText: { fontFamily: Font.sansSemibold, fontSize: 14, color: SQ.card },
});
