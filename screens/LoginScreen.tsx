import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Image, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  return (
    <ImageBackground source={require('../assets/bg.jpg')} style={styles.background} blurRadius={2}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.appName}>Христианский{'
'}помощник</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Имя пользователя, email или номер телефона" placeholderTextColor="#ddd" />
          <TextInput style={styles.input} placeholder="Пароль" placeholderTextColor="#ddd" secureTextEntry />
        </View>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Войти</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton}>
          <Image source={require('../assets/google.png')} style={styles.googleIcon} />
          <Text style={styles.googleText}>Продолжить с Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Создать аккаунт</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Guest')}>
          <Text style={styles.link}>Продолжить как гость</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 86, height: 86, resizeMode: 'contain', marginBottom: 8 },
  appName: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  inputContainer: { width: '100%', marginBottom: 12 },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#f39c12',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleText: { color: '#fff', fontSize: 15 },
  link: { color: '#fff', textDecorationLine: 'underline', marginBottom: 8 },
});
