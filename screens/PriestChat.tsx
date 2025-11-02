import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PriestChat() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вопросы священнослужителю</Text>
      <Text style={styles.subtitle}>
        Этот раздел находится в разработке. Здесь вы сможете задать вопрос
        напрямую священнику.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
});
