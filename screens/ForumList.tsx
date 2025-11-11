import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, TextInput, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import * as api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: { name: string };
  createdAt: string;
  likes: number;
  dislikes: number;
}

const FAVORITES_KEY = 'forum_favorites';

export default function ForumList() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const favs = await AsyncStorage.getItem(FAVORITES_KEY);
      setFavorites(favs ? JSON.parse(favs) : []);

      if (token) {
        const fetchedPosts: ForumPost[] = await api.getForumPosts(token);
        setPosts(fetchedPosts || []); // Fallback to empty array to prevent filter error
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Ошибка', 'Не удалось загрузить посты.');
      setPosts([]); // Ensure posts is an array on error
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleToggleFavorite = async (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Ошибка', 'Заголовок и содержание не могут быть пустыми.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await api.createForumPost(token, title, content);
        setTitle('');
        setContent('');
        fetchPosts();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Ошибка', 'Не удалось создать пост.');
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await api.likeForumPost(token, postId);
        fetchPosts();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Ошибка', 'Не удалось поставить лайк.');
    }
  };

  const handleDislike = async (postId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await api.dislikeForumPost(token, postId);
        fetchPosts();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Ошибка', 'Не удалось поставить дизлайк.');
    }
  };

  const renderItem = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity 
      style={styles.postContainer} 
      onPress={() => navigation.navigate('ForumTopic', { postId: item.id, postTitle: item.title })}
    >
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => handleToggleFavorite(item.id)}>
          <Ionicons 
            name={favorites.includes(item.id) ? 'star' : 'star-outline'} 
            size={24} 
            color={favorites.includes(item.id) ? '#f39c12' : '#ccc'} 
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
      <Text style={styles.postAuthor}>Автор: {item.author.name}</Text>
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
    </TouchableOpacity>
  );

  const favoritePosts = posts.filter(p => favorites.includes(p.id));
  const otherPosts = posts.filter(p => !favorites.includes(p.id));

  const sections = [];
  if (favoritePosts.length > 0) {
    sections.push({ title: 'Избранное', data: favoritePosts });
  }
  if (otherPosts.length > 0) {
    sections.push({ title: 'Обсуждения', data: otherPosts });
  }

  return (
    <View style={styles.container}>
      <View style={styles.createPostContainer}>
        <TextInput
          style={styles.input}
          placeholder="Заголовок"
          placeholderTextColor="#ccc"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="Что у вас на уме?"
          placeholderTextColor="#ccc"
          value={content}
          onChangeText={setContent}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handleCreatePost}>
          <Text style={styles.buttonText}>Создать пост</Text>
        </TouchableOpacity>
      </View>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPosts} tintColor="#fff" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
  createPostContainer: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#f39c12',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 5,
  },
  postContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  postContent: {
    fontSize: 14,
    color: '#eee',
    marginTop: 8,
  },
  postAuthor: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 12,
    fontStyle: 'italic',
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
