import Ionicons from "@expo/vector-icons/Ionicons"; // Using @expo/vector-icons for better Expo compatibility
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { AppRegistry } from "react-native";
import "react-native-gesture-handler";
import 'react-native-url-polyfill/auto';

// Screens (placeholders for now)
import CalendarScreen from "./screens/CalendarScreen";
import FileUploadScreen from "./screens/FileUploadScreen";
import ForumScreen from "./screens/ForumScreen";
import ForumTopicScreen from "./screens/ForumTopicScreen";
import GuestScreen from "./screens/GuestScreen";
import LoginScreen from "./screens/LoginScreen";
import NotificationScreen from "./screens/NotificationScreen";
import PriestQuestionChatScreen from "./screens/PriestQuestionChatScreen";
import PriestQuestionListScreen from "./screens/PriestQuestionListScreen";
import RegisterScreen from "./screens/RegisterScreen";

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
  Forum: undefined;
  Chat: undefined; // Re-adding Chat for now, will implement later
  // Notes: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// --- Bottom Tabs --- //
function MainTabs() {
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
          let iconName: keyof typeof Ionicons.glyphMap = "";
          if (route.name === "Guest") iconName = "home";
          else if (route.name === "Calendar") iconName = "calendar";
          else if (route.name === "Forum") iconName = "people";
          else if (route.name === "Chat") iconName = "chatbubbles";
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
            name="Chat"
            component={ChatScreen}
            options={{ title: "Чат" }}
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

AppRegistry.registerComponent("main", () => App)