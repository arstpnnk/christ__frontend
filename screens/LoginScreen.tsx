import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Image,
  Dimensions,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "../utils/api";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const extractTokenFromUrl = (url: string): string | null => {
    const match = url.match(/token=([^&]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const handleInitialUrl = async () => {
      const initial = await Linking.getInitialURL();
      if (initial) {
        const token = extractTokenFromUrl(initial);
        if (token) {
          await AsyncStorage.setItem("token", token);
          // Assuming getUserProfile is implemented in api.ts and returns user data
          const user = await api.getUserProfile(token);
          await AsyncStorage.setItem("user", JSON.stringify(user));
          navigation.replace("MainTabs");
        }
      }
    };
    handleInitialUrl();

    const sub = Linking.addEventListener("url", async ({ url }) => {
      const token = extractTokenFromUrl(url);
      if (token) {
        await AsyncStorage.setItem("token", token);
        const user = await api.getUserProfile(token);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        navigation.replace("MainTabs");
      }
    });
    return () => sub.remove();
  }, [navigation]);

  const onLogin = async () => {
    try {
      const token = await api.loginUser({ email: username, password });
      if (token) {
        await AsyncStorage.setItem("token", token);
        // Fetch user profile after successful login
        const user = await api.getUserProfile(token);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        navigation.replace("MainTabs");
      } else {
        Alert.alert("Ошибка", "Неправильные учётные данные");
      }
    } catch (e: any) {
      Alert.alert("Ошибка", e.message || "Ошибка при входе");
    }
  };

  const onGoogleLogin = async () => {
    const backendHost =
      Platform.OS === "android"
        ? "http://10.0.2.2:8080"
        : "http://localhost:8080";
    const authUrl = `${backendHost}/oauth2/authorization/google`;
    try {
      await Linking.openURL(authUrl);
    } catch (err) {
      Alert.alert("Ошибка", "Не удалось открыть браузер для авторизации");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.appName}>Христианский</Text>
          <Text style={styles.appName}>помощник</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#ddd"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor="#ddd"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
          <Text style={styles.loginText}>Войти</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} onPress={onGoogleLogin}>
          <Image
            source={require("../assets/google.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Продолжить с Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Создать аккаунт</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("MainTabs")}>
          <Text style={styles.link}>Продолжить как гость</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover", justifyContent: "center" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 24,
  },
  header: { alignItems: "center", marginBottom: 24 },
  logo: { width: 86, height: 86, resizeMode: "contain", marginBottom: 8 },
  appName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  inputContainer: { width: "100%", marginBottom: 12 },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#fff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#f39c12",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleText: { color: "#fff", fontSize: 15 },
  link: { color: "#fff", textDecorationLine: "underline", marginBottom: 8 },
});