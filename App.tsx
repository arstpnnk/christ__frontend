import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, TouchableOpacity, Text } from "react-native";
import * as api from "./utils/api";

// Экраны
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import FileUploadScreen from "./screens/FileUploadScreen";
import GuestScreen from "./screens/GuestScreen";
import CalendarScreen from "./screens/CalendarScreen";
import ChatScreen from "./screens/ChatScreen";
import ForumScreen from "./screens/ForumScreen";
import ForumTopicScreen from "./screens/ForumTopicScreen";
import PriestQuestionListScreen from "./screens/PriestQuestionListScreen";
import PriestQuestionChatScreen from "./screens/PriestQuestionChatScreen";
// import NotesScreen from "./screens/NotesScreen";
import NotificationScreen from "./screens/NotificationScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  FileUpload: {
    email: string;
    password: string;
    name: string;
    phone: string;
  };
  MainTabs: undefined;
  ForumTopic: { postId: number; postTitle: string };
  PriestQuestionList: undefined;
  PriestQuestionChat: { questionId: number; questionTitle: string };
  Notification: undefined;
};

export type TabParamList = {
  Guest: undefined;
  Calendar: undefined;
  Chat: undefined;
  Forum: undefined;
  // Notes: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

import { useFocusEffect } from "@react-navigation/native";

// --- Вкладки внизу ---
function MainTabs({ navigation }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    checkLoginStatus();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: "rgba(0,0,0,0.7)",
        },
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "rgba(0,0,0,0.7)",
          borderTopWidth: 0,
          borderRadius: 10,
          height: 47,
          position: "absolute",
          bottom: 10,
          marginRight: 18,
          marginLeft: 18,
        },
        tabBarActiveTintColor: "#C9E3AC",
        tabBarInactiveTintColor: "#ccc",
        tabBarIcon: ({ color, size }) => {
          let iconName: string = "";
          if (route.name === "Guest") iconName = "home";
          if (route.name === "Calendar") iconName = "calendar";
          if (route.name === "Forum") iconName = "people";
          // if (route.name === "Notes") iconName = "book";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Guest"
        component={GuestScreen}
        options={{ title: "Главная" }}
      />

      {isLoggedIn && (
        <>
          <Tab.Screen
            name="Forum"
            component={ForumScreen}
            options={{ title: "Форум" }}
          />
          <Tab.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{ title: "Календарь" }}
          />
          {/* <Tab.Screen
            name="Notes"
            component={NotesScreen}
            options={{ title: "Заметки" }}
          /> */}
        </>
      )}
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="FileUpload" component={FileUploadScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ForumTopic" component={ForumTopicScreen} />
        <Stack.Screen
          name="PriestQuestionList"
          component={PriestQuestionListScreen}
        />
        <Stack.Screen
          name="PriestQuestionChat"
          component={PriestQuestionChatScreen}
        />
        <Stack.Screen name="Notification" component={NotificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
