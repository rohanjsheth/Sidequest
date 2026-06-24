import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, ApiError } from "@/lib/api";
import { useSession, type SessionUser } from "@/lib/session";
import { Font, SQ } from "@/constants/sidequest";

export default function You() {
  const insets = useSafeAreaInsets();
  const { user, setUser, signOut } = useSession();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const initial = (name.trim() || user?.name || "?")[0].toUpperCase();
  const canSave = name.trim().length > 0 && name.trim() !== (user?.name ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }
  function cancel() {
    setName(user?.name ?? "");
    setEditing(false);
  }
  async function handleSignOut() {
    await signOut();
  }
  function deleteAccount() {
    if (deleting) return;

    Alert.alert(
      "Delete account?",
      "This permanently deletes your profile, friendships, RSVPs, and hosted plans.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setError(null);
            setDeleting(true);
            try {
              await api("/me", { method: "DELETE", auth: true });
              await signOut();
            } catch (err) {
              setError(
                err instanceof ApiError ? err.message : "Something went wrong",
              );
              setDeleting(false);
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.profile, { paddingTop: insets.top + 48 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        {editing ? (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={SQ.ghost}
            style={styles.nameInput}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={save}
          />
        ) : (
          <Text style={styles.name}>{user?.name ?? "You"}</Text>
        )}
      </View>

      <View style={styles.editWrap}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {editing ? (
          <View style={styles.editRow}>
            <Pressable style={styles.cancel} onPress={cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.edit,
                styles.editGrow,
                (!canSave || saving) && styles.editOff,
              ]}
              onPress={save}
              disabled={!canSave || saving}
            >
              <Text style={styles.editText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.edit} onPress={() => setEditing(true)}>
            <Text style={styles.editText}>Edit profile</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.spacer} />

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={handleSignOut}>
          <Text style={styles.actionText}>Sign out</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          style={[styles.action, deleting && styles.editOff]}
          onPress={deleteAccount}
          disabled={deleting}
        >
          <Text style={[styles.actionText, styles.danger]}>
            {deleting ? "Deleting..." : "Delete account"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SQ.card },

  profile: { alignItems: "center", gap: 13, paddingHorizontal: 24 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: SQ.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: Font.sansSemibold, fontSize: 36, color: SQ.card },
  name: {
    fontFamily: Font.sansBold,
    fontSize: 24,
    letterSpacing: -0.4,
    color: SQ.ink,
  },
  nameInput: {
    fontFamily: Font.sansBold,
    fontSize: 24,
    letterSpacing: -0.4,
    color: SQ.ink,
    textAlign: "center",
    minWidth: 180,
    borderBottomWidth: 2,
    borderBottomColor: SQ.ink,
    paddingBottom: 2,
  },

  editWrap: { paddingHorizontal: 24, paddingTop: 24 },
  error: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: "#B3261E",
    textAlign: "center",
    marginBottom: 8,
  },
  editRow: { flexDirection: "row", gap: 10 },
  edit: {
    backgroundColor: SQ.ink,
    borderRadius: 13,
    alignItems: "center",
    paddingVertical: 14,
  },
  editGrow: { flex: 1 },
  editOff: { opacity: 0.35 },
  editText: { fontFamily: Font.sansSemibold, fontSize: 13, color: SQ.card },
  cancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: SQ.line,
    borderRadius: 13,
    alignItems: "center",
    paddingVertical: 14,
  },
  cancelText: { fontFamily: Font.sansSemibold, fontSize: 13, color: SQ.ink },

  spacer: { flex: 1 },

  actions: { paddingHorizontal: 24, paddingBottom: 28 },
  action: { paddingVertical: 15 },
  actionText: { fontFamily: Font.sansMedium, fontSize: 14, color: SQ.ink },
  danger: { color: "#B3261E" },
  divider: { height: 1, backgroundColor: SQ.rule },
});
