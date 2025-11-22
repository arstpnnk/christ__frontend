import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Image,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import * as api from "../utils/api";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const onContinue = () => {
    if (!email || !password || !username || !phone) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля.");
      return;
    }
    if (password.length < 10) {
      Alert.alert("Ошибка", "Пароль должен быть не менее 10 символов.");
      return;
    }
    if (!/^[a-zA-Z]+$/.test(username)) {
      Alert.alert("Ошибка", "Имя пользователя может содержать только буквы.");
      return;
    }
    if (!email.includes('@')) {
      Alert.alert("Ошибка", "Неверный формат электронной почты.");
      return;
    }
    navigation.navigate("FileUpload", {
      email,
      password,
      name: username,
      phone,
    });
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
          <Text style={styles.appName}>Христианский{"\n"}помощник</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#ddd"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Имя пользователя"
            placeholderTextColor="#ddd"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Номер телефона"
            placeholderTextColor="#ddd"
            value={phone}
            onChangeText={setPhone}
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

        <TouchableOpacity style={styles.loginButton} onPress={onContinue}>
          <Text style={styles.loginText}>Продолжить</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} onPress={onGoogleLogin}>
          <Image
            source={require("../assets/google.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Продолжить с Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Войти</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("MainTabs")}>
          <Text style={styles.link}>Продолжить как гость</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

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
  link: { color: "#fff", textDecorationLine: "underline", marginTop: 4 },
});