import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../App';
import * as api from '../utils/api';

type ForumTopicScreenRouteProp = RouteProp<RootStackParamList, 'ForumTopic'>;

interface ChatMessage {
  id: number;
  content: string;
  sender: { name: string };
  createdAt: string;
  likes: number;
  dislikes: number;
}

export default function ForumTopicScreen() {
  const route = useRoute<ForumTopicScreenRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { postId, postTitle } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        setCurrentUser(JSON.parse(userString));
      }
    };
    getData();
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const fetchedMessages: ChatMessage[] = await api.getForumPostMessages(token, postId);
      if (Array.isArray(fetchedMessages)) {
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      Alert.alert('Ошибка', 'Не удалось загрузить сообщения.');
    }
  }, [token, postId]);

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
      await api.sendForumPostMessage(token, postId, newMessage);
      setNewMessage('');
      fetchMessages(); // Refresh messages after sending
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение.');
    }
  };

  const handleLike = async (messageId: number) => {
    if (!token) return;
    try {
      await api.likeForumPostMessage(token, postId, messageId);
      fetchMessages();
    } catch (error) {
      console.error("Failed to like message:", error);
      Alert.alert('Ошибка', 'Не удалось поставить лайк.');
    }
  };

  const handleDislike = async (messageId: number) => {
    if (!token) return;
    try {
      await api.dislikeForumPostMessage(token, postId, messageId);
      fetchMessages();
    } catch (error) {
      console.error("Failed to dislike message:", error);
      Alert.alert('Ошибка', 'Не удалось поставить дизлайк.');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageContainer, item.sender.name === currentUser?.name ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.messageAuthor}>{item.sender.name}</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageTime}>{new Date(item.createdAt).toLocaleString()}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
          <Ionicons name="thumbs-up-outline" size={20} color="#ccc" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDislike(item.id)}>
          <Ionicons name="thumbs-down-outline" size={20} color="#ccc" />
          <Text style={styles.actionText}>{item.dislikes}</Text>
        </TouchableOpacity>
      </View>
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
          <Text style={styles.title}>{postTitle}</Text>
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Напишите сообщение..."
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
  postActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    color: '#ccc',
    marginLeft: 4,
  },
});