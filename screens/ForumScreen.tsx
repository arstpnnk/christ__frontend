import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import ForumList from './ForumList';
import PriestQuestionListScreen from './PriestQuestionListScreen';

type Tab = 'Forum' | 'PriestQuestionList';

export default function ForumScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Forum');

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Обсуждения</Text>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Forum' && styles.activeTab]} 
            onPress={() => setActiveTab('Forum')}
          >
            <Text style={styles.tabText}>Форум</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'PriestQuestionList' && styles.activeTab]} 
            onPress={() => setActiveTab('PriestQuestionList')}
          >
            <Text style={styles.tabText}>Вопросы священнику</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === 'Forum' ? <ForumList /> : <PriestQuestionListScreen />}
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
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
});
