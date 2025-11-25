import Icon from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { RootStackParamList } from '../App';
import * as api from "../utils/api";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CalendarScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [openNote, setOpenNote] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsLoggedIn(!!token);
      if (token) {
        try {
          const userString = await AsyncStorage.getItem("user");
          const user = userString ? JSON.parse(userString) : null;
          let parsed = {};

          if (user && user.id) {
            const savedNotes = await AsyncStorage.getItem(`calendarNotes_${user.id}`);
            if (savedNotes) {
              parsed = JSON.parse(savedNotes);
              setNotes(parsed);
            }
          }

          const fetchedHolidays = await api.getHolidays(token);
          setHolidays(fetchedHolidays);
          updateMarkedDates(parsed, fetchedHolidays);

          const notifications = await api.getNotifications(token);
          if (Array.isArray(notifications)) {
            const unread = notifications.filter((n: any) => !n.read).length;
            setUnreadNotifications(unread);
          }
        } catch (error) {
          console.error("Failed to fetch calendar data:", error);
          Alert.alert("Ошибка", "Не удалось загрузить данные календаря.");
        }
      }
    };
    checkLoginStatus();
  }, []);

  const updateMarkedDates = (notesData: { [key: string]: string }, holidaysData: any[], selected: string | null = selectedDate) => {
    const newMarks: { [key: string]: any } = {};

    // Mark notes
    Object.keys(notesData).forEach((date) => {
      newMarks[date] = {
        selected: true,
        selectedColor: "#ffb703",
        selectedTextColor: "#000",
      };
    });

    // Mark holidays
    holidaysData.forEach((holidayItem) => {
      const holidayDate = holidayItem.date;
      if (newMarks[holidayDate]) {
        // If there's already a note, add a dot to it
        newMarks[holidayDate].dots = [{
          key: 'holiday',
          color: '#007bff',
          selectedDotColor: '#007bff'
        }];
        newMarks[holidayDate].marked = true;
      } else {
        newMarks[holidayDate] = {
          dots: [{
            key: 'holiday',
            color: '#007bff',
            selectedDotColor: '#007bff'
          }],
          marked: true
        };
      }
    });

    // Mark selected date
    if (selected) {
      newMarks[selected] = {
        ...newMarks[selected],
        selected: true,
        selectedColor: "#ffb703",
        selectedTextColor: "#000",
      };
    }
    setMarkedDates(newMarks);
  };

  const saveNote = async () => {
    if (!selectedDate) return;
    const token = await AsyncStorage.getItem("token");
    const userString = await AsyncStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!user || !user.id) {
      Alert.alert("Ошибка", "Пользователь не авторизован.");
      return;
    }

    const updated = { ...notes, [selectedDate]: note };
    setNotes(updated);
    await AsyncStorage.setItem(`calendarNotes_${user.id}`, JSON.stringify(updated));
    if (token) {
      await api.createNote(token, note);
    }
    updateMarkedDates(updated, holidays); // Pass holidays as well
    setNote("");
    setOpenNote(false);
  };

  const holiday = holidays.find((h) => h.date === selectedDate);

  const toggleNote = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenNote(!openNote);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="person-circle-outline" size={28} color="#fff" />
        <Text style={styles.headerTitle}>Христианский помощник</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
            <Icon name="notifications-outline" size={26} color="#fff" />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.calendarCard}>
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              updateMarkedDates(notes, holidays, day.dateString); // Pass holidays as well
              setOpenNote(false); 
            }}
            monthFormat={"MMMM yyyy"}
            markedDates={markedDates}
            markingType={'multi-dot'}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: "#fff",
              dayTextColor: "#fff",
              todayTextColor: "#ffb703",
              selectedDayTextColor: "#000",
              monthTextColor: "#fff",
              arrowColor: "#fff",
            }}
          />
          {isLoggedIn && notes[selectedDate] && (
            <Text style={styles.savedNote}>{notes[selectedDate]}</Text>
          )}
          {holiday && (
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>{holiday.title}</Text>
              <Text style={styles.eventDescription}>{holiday.description}</Text>
            </View>
          )}
          {isLoggedIn && selectedDate && !openNote && (
            <View style={styles.noteSection}>
              <TouchableOpacity
                style={styles.addNoteButton}
                onPress={toggleNote}
              >
                <Image
                  source={require("../assets/add-calendar.png")}
                  style={styles.calendarImage}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isLoggedIn && selectedDate && openNote && (
          <View style={styles.noteContainer}>
            <TextInput
              style={styles.input}
              placeholder="Описание..."
              placeholderTextColor="#888"
              value={note}
              onChangeText={setNote}
              multiline
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Сохранить
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e1e1e" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2d2d2d",
    padding: 10,
  },
  calendarImage: {
    width: 23,
    height: 23,
    color: "#fff",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  calendarCard: {
    margin: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Полупрозрачный фон для эффекта блюра
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000", // Добавляем тень, чтобы улучшить внешний вид
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventCard: {
    borderTopColor: "#555",
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  eventTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventDescription: { color: "#ccc", fontSize: 13 },
  noteSection: {
    position: "relative",
    bottom: 10,
    right: 0,
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  addNoteButton: {
    width: 45,
    height: 45,
    backgroundColor: "#ffb703",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    display: "flex",
  },
  noteContainer: { marginTop: 10, paddingBottom: 40 },
  input: {
    backgroundColor: "#2d2d2d",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    height: 80,
  },
  saveButton: {
    backgroundColor: "#ffb703",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  savedNote: {
    color: "#fff",
    display: "flex",
    width: "90%",
    margin: "5%",
    justifyContent: "flex-start",
    marginTop: 5,
    fontStyle: "italic",
  },
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