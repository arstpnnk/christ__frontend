import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import * as api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const fetchedNotifications: Notification[] = await api.getNotifications(token);
        if (Array.isArray(fetchedNotifications)) {
          setNotifications(fetchedNotifications);
        } else {
          setNotifications([]);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Ошибка', 'Не удалось загрузить уведомления.');
      setNotifications([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await api.markNotificationAsRead(token, id);
        fetchNotifications();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Ошибка', 'Не удалось отметить уведомление как прочитанное.');
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationContainer, item.read ? styles.readNotification : styles.unreadNotification]}
      onPress={() => !item.read && handleMarkAsRead(item.id)}
    >
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>{new Date(item.createdAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Уведомления</Text>
      </View>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>нет уведомлений</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} tintColor="#fff" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: '#1c1c1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ccc',
    fontSize: 18,
  },
  list: {
    flex: 1,
  },
  notificationContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  readNotification: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(243, 156, 18, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  notificationMessage: {
    fontSize: 16,
    color: '#fff',
  },
  notificationTime: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 8,
  },
});