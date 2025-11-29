import Ionicons from "@expo/vector-icons/Ionicons"; // Using @expo/vector-icons for better Expo compatibility
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { AppRegistry, Image, StyleSheet, View } from "react-native";
import "react-native-gesture-handler";
import "react-native-url-polyfill/auto";
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
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#ccc",
        tabBarIcon: ({ focused, color, size }) => {
          let iconComponent;
          const iconStyle = { width: size, height: size, tintColor: color };
          
          if (route.name === "Guest") {
            iconComponent = <Image source={require("./assets/homeIcon.png")} style={iconStyle} />;
          } else if (route.name === "Calendar") {
            iconComponent = <Image source={require("./assets/calendarIcon.png")} style={iconStyle} />;
          } else if (route.name === "Forum") {
            iconComponent = <Image source={require("./assets/chatIcon.png")} style={iconStyle} />;
          } else if (route.name === "Chat") {
            iconComponent = <Ionicons name="chatbubbles" size={size} color={color} />;
          }

          return (
            <View style={focused ? styles.activeTab : styles.inactiveTab}>
              {iconComponent}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Guest"
        component={GuestScreen}
        options={{ title: "" }}
      />
      <Tab.Screen
        name="Calendar"
        // @ts-ignore
        component={(props) => (
          <CalendarScreen {...props} isLoggedIn={isLoggedIn} />
        )}
        options={{ title: "" }}
      />
      {isLoggedIn && (
        <>
          <Tab.Screen
            name="Forum"
            component={ForumScreen}
            options={{ title: "" }}
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

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: '#C9E3AC',
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 8,
    color: 'black'
  },
  inactiveTab: {
    padding: 5,
  },
});;
