import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Guest'>;

export default function GuestScreen({ navigation }: Props) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Добро пожаловать, гость!</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.btn}>
        <Text style={styles.btnText}>Вернуться</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#fff' },
  title: { fontSize:20, marginBottom:16 },
  btn: { padding:12, backgroundColor:'#333', borderRadius:8 },
  btnText: { color:'#fff', fontWeight:'700' }
});
