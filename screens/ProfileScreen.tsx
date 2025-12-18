import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../App";

type StoredUser = { name?: string } | null;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userName, setUserName] = useState<string>("Гость");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      const userRaw = await AsyncStorage.getItem("user");
      const user: StoredUser = userRaw ? JSON.parse(userRaw) : null;
      if (user?.name) setUserName(user.name);

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

          <TouchableOpacity style={styles.editButton} activeOpacity={0.85}>
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

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.85}>
            <Text style={styles.actionText}>Сменить пароль</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            activeOpacity={0.85}
            onPress={confirmLogout}
          >
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
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
});
