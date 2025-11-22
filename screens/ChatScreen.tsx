import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../App';

interface ChatMessage {
  id: number;
  content: string;
  sender: {
    name: string;
  };
  timestamp: string;
}

type Props = BottomTabScreenProps<TabParamList, 'Chat'>;

export default function ChatScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUserName(user.name);
      }
    };
    loadUserData();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const fetchedMessages = await api.getChatMessages(token);
        if (Array.isArray(fetchedMessages)) {
          setMessages(fetchedMessages);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
      // Alert.alert('Ошибка', 'Не удалось загрузить сообщения чата.');
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Refresh messages every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!content.trim()) {
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await api.sendChatMessage(token, content);
        setContent('');
        fetchMessages(); // Refresh messages after sending a new one
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение.');
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageContainer, item.sender.name === currentUserName ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.messageSender}>{item.sender.name}:</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
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
        <Text style={styles.title}>Общий чат</Text>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          inverted
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Введите сообщение..."
            placeholderTextColor="#ccc"
            value={content}
            onChangeText={setContent}
          />
          <TouchableOpacity style={styles.button} onPress={handleSendMessage}>
            <Text style={styles.buttonText}>Отправить</Text>
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
    padding: 16,
    paddingTop: 40, // Adjust for header if needed
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  list: {
    flex: 1,
  },
  messageContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
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
  messageSender: {
    fontWeight: 'bold',
    color: '#C9E3AC',
    marginBottom: 2,
  },
  messageContent: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
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
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#f39c12',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});