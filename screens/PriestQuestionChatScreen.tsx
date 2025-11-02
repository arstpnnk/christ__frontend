import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as api from '../utils/api';
import { RootStackParamList } from '../App';

type PriestQuestionChatScreenRouteProp = RouteProp<RootStackParamList, 'PriestQuestionChat'>;

interface PriestQuestionReply {
  id: number;
  content: string;
  author: { name: string; role: string }; // Assuming author has a role (e.g., 'USER', 'PRIEST')
  createdAt: string;
}

export default function PriestQuestionChatScreen() {
  const route = useRoute<PriestQuestionChatScreenRouteProp>();
  const navigation = useNavigation();
  const { questionId, questionTitle } = route.params;

  const [messages, setMessages] = useState<PriestQuestionReply[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
      // In a real app, you'd fetch the current user's name from an API using the token
      // For now, we'll use a placeholder or try to get it from stored user info
      const storedUserName = await AsyncStorage.getItem('userName'); // Assuming you store user name on login
      setCurrentUserName(storedUserName);
    };
    loadUserData();
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      // Assuming an API endpoint to get replies for a specific priest question
      // You'll need to implement this in your backend and api.ts
      const fetchedMessages: PriestQuestionReply[] = await api.getPriestQuestionReplies(token, questionId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to fetch priest question replies:", error);
      Alert.alert('Ошибка', 'Не удалось загрузить ответы.');
    }
  }, [token, questionId]);

  useEffect(() => {
    if (token) {
      fetchMessages();
    }
  }, [token, fetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !token) {
      return;
    }
    try {
      // Assuming an API endpoint to send a reply to a specific priest question
      // You'll need to implement this in your backend and api.ts
      await api.sendPriestQuestionReply(token, questionId, newMessage);
      setNewMessage('');
      fetchMessages(); // Refresh messages after sending
    } catch (error) {
      console.error("Failed to send reply:", error);
      Alert.alert('Ошибка', 'Не удалось отправить ответ.');
    }
  };

  const renderMessage = ({ item }: { item: PriestQuestionReply }) => (
    <View style={[styles.messageContainer, item.author.name === currentUserName ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.messageAuthor}>{item.author.name}</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{questionTitle}</Text>
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          inverted // To show latest messages at the bottom
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Напишите ответ..."
            placeholderTextColor="#ccc"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageListContent: {
    justifyContent: 'flex-end',
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#f39c12',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  messageAuthor: {
    fontSize: 12,
    color: '#ddd',
    marginBottom: 2,
  },
  messageContent: {
    fontSize: 16,
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#ccc',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#f39c12',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
