import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../App";
import * as api from "../utils/api";

type StoredUser = { name?: string; phone?: string } | null;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userName, setUserName] = useState<string>("Гость");
  const [phone, setPhone] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const load = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
      setIsLoggedIn(!!storedToken);

      if (storedToken) {
        try {
          const user = await api.getUserProfile(storedToken);
          if (user?.name) setUserName(user.name);
          else setUserName("Пользователь");
          if (user?.phone) setPhone(user.phone);
          await AsyncStorage.setItem("user", JSON.stringify(user));
        } catch {
          const userRaw = await AsyncStorage.getItem("user");
          const user: StoredUser = userRaw ? JSON.parse(userRaw) : null;
          if (user?.name) setUserName(user.name);
          if (user?.phone) setPhone(user.phone);
        }
      } else {
        const guestName = await AsyncStorage.getItem("guest_profile_name");
        const guestPhone = await AsyncStorage.getItem("guest_profile_phone");
        if (guestName) setUserName(guestName);
        if (guestPhone) setPhone(guestPhone);
      }

      const soundRaw = await AsyncStorage.getItem("settings_sound");
      if (soundRaw !== null) setSoundEnabled(soundRaw === "1");
    };
    load();
  }, []);

  const toggleSound = async () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      AsyncStorage.setItem("settings_sound", next ? "1" : "0").catch(() => {});
      return next;
    });
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const confirmLogout = () => {
    Alert.alert("Выход", "Выйти из аккаунта?", [
      { text: "Отмена", style: "cancel" },
      { text: "Выйти", style: "destructive", onPress: logout },
    ]);
  };

  const openEdit = () => {
    setEditName(userName === "Гость" ? "" : userName);
    setEditPhone(phone);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    const nextName = editName.trim() || "Гость";
    const nextPhone = editPhone.trim();

    if (isLoggedIn && token) {
      try {
        const updated = await api.updateUserProfile(token, {
          name: nextName,
          phone: nextPhone,
        });
        setUserName(updated?.name || nextName);
        setPhone(updated?.phone || nextPhone);
        await AsyncStorage.setItem("user", JSON.stringify(updated));
        setEditOpen(false);
      } catch (e: any) {
        Alert.alert("Ошибка", e?.message || "Не удалось сохранить профиль");
      }
      return;
    }

    await AsyncStorage.setItem("guest_profile_name", nextName);
    await AsyncStorage.setItem("guest_profile_phone", nextPhone);
    setUserName(nextName);
    setPhone(nextPhone);
    setEditOpen(false);
  };

  const openChangePassword = () => {
    setOldPassword("");
    setNewPassword("");
    setPasswordOpen(true);
  };

  const submitChangePassword = async () => {
    if (!token) return;
    if (!oldPassword.trim() || !newPassword.trim()) {
      Alert.alert("Ошибка", "Заполни старый и новый пароль");
      return;
    }
    try {
      await api.changePassword(token, oldPassword, newPassword);
      setPasswordOpen(false);
      Alert.alert("Готово", "Пароль изменен");
    } catch (e: any) {
      const raw = String(e?.message || "").trim();
      const msg =
        raw === "invalid_old_password"
          ? "Неправильный старый пароль"
          : raw === "oauth_user_no_password"
            ? "Нельзя сменить пароль для входа через Google"
            : raw === "new_password_required"
              ? "Новый пароль обязателен"
              : raw || "Не удалось сменить пароль";
      Alert.alert("Ошибка", msg);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      blurRadius={2}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileBlock}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={56} color="#fff" />
          </View>
          <Text style={styles.userName}>{userName}</Text>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.85}
            onPress={openEdit}
          >
            <Text style={styles.editText}>Редактировать</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки:</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Звук уведомлений</Text>
            <TouchableOpacity
              onPress={toggleSound}
              activeOpacity={0.85}
              style={styles.toggleButton}
            >
              <Image
                source={
                  soundEnabled
                    ? require("../файлы для новых экранов/иконки/turn on.png")
                    : require("../файлы для новых экранов/иконки/turn off.png")
                }
                style={styles.toggleIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {isLoggedIn && (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={openChangePassword}
            >
              <Text style={styles.actionText}>Сменить пароль</Text>
            </TouchableOpacity>
          )}

          {isLoggedIn ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              activeOpacity={0.85}
              onPress={confirmLogout}
            >
              <Text style={styles.logoutText}>Выйти из аккаунта</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.loginButton]}
              activeOpacity={0.85}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: "Login" }] })}
            >
              <Text style={styles.loginText}>Войти в аккаунт</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal transparent visible={editOpen} animationType="fade" onRequestClose={() => setEditOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setEditOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Редактировать профиль</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Имя"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.modalInput}
            />
            <TextInput
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Телефон"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtn} activeOpacity={0.85} onPress={() => setEditOpen(false)}>
                <Text style={styles.modalBtnText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} activeOpacity={0.85} onPress={saveEdit}>
                <Text style={[styles.modalBtnText, styles.modalBtnPrimaryText]}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal transparent visible={passwordOpen} animationType="fade" onRequestClose={() => setPasswordOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPasswordOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Смена пароля</Text>
            <TextInput
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Старый пароль"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.modalInput}
              secureTextEntry
            />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Новый пароль"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.modalInput}
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtn} activeOpacity={0.85} onPress={() => setPasswordOpen(false)}>
                <Text style={styles.modalBtnText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} activeOpacity={0.85} onPress={submitChangePassword}>
                <Text style={[styles.modalBtnText, styles.modalBtnPrimaryText]}>Сменить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },

  topRow: {
    paddingTop: 46,
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  profileBlock: { alignItems: "center", marginTop: 10 },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  userName: { marginTop: 10, color: "#fff", fontSize: 16, fontWeight: "700" },
  editButton: {
    marginTop: 10,
    backgroundColor: "#F0A84D",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  editText: { color: "#000", fontWeight: "800" },

  section: {
    marginTop: 14,
    paddingHorizontal: 14,
  },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 8 },

  settingRow: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  settingText: { color: "#fff", fontWeight: "700" },
  toggleButton: { padding: 2 },
  toggleIcon: { width: 42, height: 22 },

  actionButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionText: { color: "#fff", fontWeight: "800" },

  logoutButton: { backgroundColor: "rgba(0,0,0,0.55)" },
  logoutText: { color: "#FF6B6B", fontWeight: "900" },

  loginButton: { backgroundColor: "rgba(0,0,0,0.55)" },
  loginText: { color: "#C9E3AC", fontWeight: "900" },

  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  modalCard: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 160,
    backgroundColor: "rgba(0,0,0,0.88)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  modalTitle: { color: "#fff", fontWeight: "900", fontSize: 16, marginBottom: 10 },
  modalInput: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    color: "#fff",
    marginBottom: 10,
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 4 },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  modalBtnPrimary: { backgroundColor: "#F0A84D" },
  modalBtnText: { color: "#fff", fontWeight: "800" },
  modalBtnPrimaryText: { color: "#000" },
});
