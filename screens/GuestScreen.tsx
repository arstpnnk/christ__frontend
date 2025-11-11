import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   ImageBackground,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import MapView, { Marker, UrlTile } from "react-native-maps";
// import Icon from "react-native-vector-icons/Ionicons";
// import * as Location from "expo-location";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const defaultChurches = [
//   { id: 1, title: "Церковь Благодать", lat: 53.905, lon: 27.561 },
//   { id: 2, title: "Храм Всех Святых", lat: 53.932, lon: 27.578 },
// ];

// // A default location for the map to show immediately.
// const defaultLocation = {
//   coords: {
//     latitude: 53.9045,
//     longitude: 27.5615,
//   },
// };
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import * as api from '../utils/api';

const defaultChurches = [
  { id: 1, title: "Церковь Благодать", lat: 53.905, lon: 27.561 },
  { id: 2, title: "Храм Всех Святых", lat: 53.932, lon: 27.578 },
];

// A default location for the map to show immediately.
const defaultLocation = {
  coords: {
    latitude: 53.9045,
    longitude: 27.5615,
  },
};

export default function GuestScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [churches, setChurches] = useState(defaultChurches);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [location, setLocation] = useState<any>(defaultLocation);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsLoggedIn(!!token);
      if (token) {
        const notifications = await api.getNotifications(token);
        const unread = notifications.filter((n: any) => !n.read).length;
        setUnreadNotifications(unread);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setIsLoggedIn(false);
    Alert.alert("Выход", "Вы успешно вышли из системы.");
  };

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      blurRadius={2}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLogout}>
            <Icon name="person-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isLoggedIn ? "Вы вошли в систему" : "Вы вошли как гость"}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
            <Icon name="notifications-outline" size={26} color="#fff" />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quotes}
          >
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>
                «Любовь к ближнему начинается с любви к Богу»{"\n"}(Серафим
                Саровский)
              </Text>
            </View>
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>
                «Улыбнитесь — и вы подарите частичку радости окружающим»
              </Text>
            </View>
          </ScrollView>

          <View style={styles.banner}>
            <Image
              source={require("../assets/chrome.jpg")}
              style={styles.bannerImage}
            />
            <Text style={styles.bannerText}>С Рождеством Христовым!</Text>
          </View>

          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>
              Карта местоположений религиозных организаций
            </Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
              />
              {churches.map((ch) => (
                <Marker
                  key={ch.id}
                  coordinate={{ latitude: ch.lat, longitude: ch.lon }}
                  title={ch.title}
                />
              ))}
            </MapView>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover", justifyContent: "center" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  quotes: { padding: 10 },
  quoteCard: {
    backgroundColor: "#2e2e2e",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    width: 250,
  },
  quoteText: { color: "#fff", fontSize: 13 },
  banner: {
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  bannerImage: { width: "100%", height: 160 },
  bannerText: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  mapCard: {
    margin: 10,
    backgroundColor: "#2e2e2e",
    borderRadius: 12,
    padding: 10,
  },
  mapTitle: { color: "#fff", marginBottom: 6 },
  map: { width: "100%", height: 200, borderRadius: 10 },
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
