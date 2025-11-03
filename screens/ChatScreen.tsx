import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatMessage {
  id: number;
  content: string;
  sender: {
    name: string;
  };
  timestamp: string;
}

export defaulgit statut function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');

  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const fetchedMessages = await api.getChatMessages(token);
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error(error);
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
      console.error(error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение.');
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageSender}>{item.sender.name}:</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlay}>
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
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  list: {
    flex: 1,
  },
  messageContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  messageSender: {
    fontWeight: 'bold',
    color: '#f39c12',
  },
  messageContent: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
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
