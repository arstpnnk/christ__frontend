import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "../utils/api";
import * as DocumentPicker from "expo-document-picker";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = NativeStackScreenProps<RootStackParamList, "FileUpload">;

export default function FileUploadScreen({ route, navigation }: Props) {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const { email, password, name, phone } = route.params;

  const onRegister = async () => {
    try {
      const token = await api.registerUser({
        email,
        password,
        name,
        phone,
        isFileUploaded: !!file,
      });
      if (token) {
        await AsyncStorage.setItem("token", token);
        if (file) {
          const fileData: any = Platform.OS === 'web' ? file.file : {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
          };
          await api.uploadFile(token, fileData);
        }
        navigation.replace("MainTabs");
      } else {
        Alert.alert("Ошибка", "Не удалось зарегистрироваться");
      }
    } catch (e: any) {
      Alert.alert("Ошибка", e.message || "Ошибка при регистрации");
    }
  };

  const onPickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (e: any) {
      Alert.alert("Ошибка", e.message || "Не удалось выбрать файл.");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.background}
      blurRadius={5}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.container}>
          <Text style={styles.title}>Загрузка документа</Text>
          <Text style={styles.subtitle}>
            Для подтверждения статуса священнослужителя, пожалуйста, загрузите соответствующий документ.
          </Text>

          <View style={styles.uploadBox}>
            <Ionicons name="cloud-upload-outline" size={60} color="#fff" style={{ marginBottom: 15 }} />
            <Text style={styles.uploadText}>Перетащите или выберите файл</Text>
            <TouchableOpacity style={styles.selectButton} onPress={onPickFile}>
              <Text style={styles.selectButtonText}>Выбрать файл</Text>
            </TouchableOpacity>
            {file && <Text style={styles.fileName}>{file.name}</Text>}
            <Text style={styles.fileInfo}>Максимальный размер файла: 10MB</Text>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={onRegister}>
            <Text style={styles.registerButtonText}>Завершить регистрацию</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.replace("MainTabs")}>
            <Text style={styles.skipText}>Пропустить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  container: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 25,
  },
  uploadBox: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  uploadText: {
    color: '#fff',
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fileName: {
    color: '#C9E3AC',
    marginTop: 15,
    fontStyle: 'italic',
  },
  fileInfo: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 15,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#f39c12',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipText: {
    color: '#ccc',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
});