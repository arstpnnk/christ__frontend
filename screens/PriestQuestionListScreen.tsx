import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, RefreshControl, ImageBackground } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as api from '../utils/api';
import { RootStackParamList } from '../App';

interface PriestQuestion {
  id: number;
  title: string;
  question: string;
  status: 'OPEN' | 'ANSWERED';
  createdAt: string;
}

export default function PriestQuestionListScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [questions, setQuestions] = useState<PriestQuestion[]>([]);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Assuming an API endpoint to get priest questions
        // You'll need to implement this in your backend and api.ts
        const fetchedQuestions: PriestQuestion[] = await api.getPriestQuestions(token);
        setQuestions(fetchedQuestions);
      }
    } catch (error) {
      console.error("Failed to fetch priest questions:", error);
      Alert.alert('Ошибка', 'Не удалось загрузить вопросы.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleCreateQuestion = async () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) {
      Alert.alert('Ошибка', 'Заголовок и вопрос не могут быть пустыми.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Assuming an API endpoint to create a priest question
        // You'll need to implement this in your backend and api.ts
        await api.createPriestQuestion(token, newQuestionTitle, newQuestionContent);
        setNewQuestionTitle('');
        setNewQuestionContent('');
        fetchQuestions();
      }
    } catch (error) {
      console.error("Failed to create priest question:", error);
      Alert.alert('Ошибка', 'Не удалось создать вопрос.');
    }
  };

  const renderItem = ({ item }: { item: PriestQuestion }) => (
    <TouchableOpacity 
      style={styles.questionContainer} 
      onPress={() => navigation.navigate('PriestQuestionChat', { questionId: item.id, questionTitle: item.title })}
    >
      <View style={styles.questionHeader}>
        <Text style={styles.questionTitle}>{item.title}</Text>
        {/* <Text style={[styles.status, item.status === 'OPEN' ? styles.statusOpen : styles.statusAnswered]}>
          {item.status === 'OPEN' ? 'Открыт' : 'Отвечен'}
        </Text> */}
      </View>
      <Text style={styles.questionContent}>{item.question}</Text>
      <Text style={styles.questionDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        <View style={styles.createQuestionContainer}>
          <TextInput
            style={styles.input}
            placeholder="Заголовок вопроса"
            placeholderTextColor="#ccc"
            value={newQuestionTitle}
            onChangeText={setNewQuestionTitle}
          />
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="Ваш вопрос священнику..."
            placeholderTextColor="#ccc"
            value={newQuestionContent}
            onChangeText={setNewQuestionContent}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={handleCreateQuestion}>
            <Text style={styles.buttonText}>Задать вопрос</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchQuestions} tintColor="#fff" />}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingTop: 10,
  },
  createQuestionContainer: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: 16,
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
    paddingHorizontal: 16,
  },
  questionContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusOpen: {
    backgroundColor: '#f39c12',
    color: '#fff',
  },
  statusAnswered: {
    backgroundColor: '#28a745',
    color: '#fff',
  },
  questionContent: {
    fontSize: 14,
    color: '#eee',
    marginTop: 8,
  },
  questionDate: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
