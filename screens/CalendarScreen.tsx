import Icon from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
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
import { Calendar, LocaleConfig } from "react-native-calendars";
import { RootStackParamList } from "../App";
import * as api from "../utils/api";

LocaleConfig.locales["ru"] = {
  monthNames: [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ],
  monthNamesShort: [
    "Янв.",
    "Февр.",
    "Март",
    "Апр.",
    "Май",
    "Июнь",
    "Июль.",
    "Авг.",
    "Сент.",
    "Окт.",
    "Нояб.",
    "Дек.",
  ],
  dayNames: [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ],
  dayNamesShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  today: "Сегодня",
};

LocaleConfig.defaultLocale = "ru";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CalendarScreen({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ [key: string]: string[] }>({});
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [openNote, setOpenNote] = useState(false);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          const userString = await AsyncStorage.getItem("user");
          const user = userString ? JSON.parse(userString) : null;
          let parsed = {};

          if (user && user.id) {
            const savedNotes = await AsyncStorage.getItem(
              `calendarNotes_${user.id}`
            );
            if (savedNotes) {
              const parsedNotes = JSON.parse(savedNotes);
              // Data migration for old string-based notes
              Object.keys(parsedNotes).forEach(key => {
                if (typeof parsedNotes[key] === 'string') {
                  parsedNotes[key] = [parsedNotes[key]];
                }
              });
              setNotes(parsedNotes);
              parsed = parsedNotes;
            }
          }

          const fetchedHolidays = await api.getHolidays(token);
          setHolidays(fetchedHolidays);
          updateMarkedDates(parsed, fetchedHolidays);

          const unreadCount = await api.getUnreadNotifications(token);
          if (typeof unreadCount === "number") {
            setUnreadNotifications(unreadCount);
          } else {
            setUnreadNotifications(0);
          }
        } catch (error) {
          console.error("Failed to fetch calendar data:", error);
          Alert.alert("Ошибка", "Не удалось загрузить данные календаря.");
        }
      }
    };
    fetchData();
  }, [isLoggedIn]);

  const updateMarkedDates = (
    notesData: { [key: string]: string[] },
    holidaysData: any[],
    selected: string | null = selectedDate
  ) => {
    const newMarks: { [key: string]: any } = {};

    // Process notes
    Object.keys(notesData).forEach((date) => {
      if (notesData[date] && notesData[date].length > 0) {
        if (!newMarks[date]) newMarks[date] = { dots: [] };
        newMarks[date].dots.push({ key: 'note', color: '#ffb703' });
      }
    });

    // Process holidays
    holidaysData.forEach((holidayItem) => {
      const holidayDate = holidayItem.date;
      if (!newMarks[holidayDate]) newMarks[holidayDate] = { dots: [] };
      newMarks[holidayDate].dots.push({ key: 'holiday', color: '#007bff' });
    });

    // Mark selected date
    if (selected) {
      if (!newMarks[selected]) {
        newMarks[selected] = {};
      }
      newMarks[selected].selected = true;
    }

    setMarkedDates(newMarks);
  };

  const saveNote = async () => {
    if (!selectedDate || !note) return;
    const token = await AsyncStorage.getItem("token");
    const userString = await AsyncStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!user || !user.id) {
      Alert.alert("Ошибка", "Пользователь не авторизован.");
      return;
    }

    const existingNotes = notes[selectedDate] || [];
    const updatedNotes = [...existingNotes, note];
    const updated = { ...notes, [selectedDate]: updatedNotes };

    setNotes(updated);
    await AsyncStorage.setItem(
      `calendarNotes_${user.id}`,
      JSON.stringify(updated)
    );
    if (token) {
      // Assuming the API can handle multiple notes, you might need to adjust this part
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

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    updateMarkedDates(notes, holidays, day.dateString);
    setOpenNote(false);
  };
  
  const CustomDay = ({ date, state, marking }: { date: any, state: any, marking: any }) => {
    const { dots, selected } = marking || {};
    let borderColor = 'transparent';
    if (dots?.some((d: any) => d.key === 'note')) {
      borderColor = '#ffb703';
    } else if (dots?.some((d: any) => d.key === 'holiday')) {
      borderColor = '#007bff';
    }

    return (
      <TouchableOpacity onPress={() => onDayPress(date)} style={[
          styles.dayContainer, 
          { borderColor: selected ? '#ffb703' : borderColor,
            backgroundColor: selected ? '#ffb703' : 'transparent'
          }
        ]}>
        <View style={styles.dotsContainer}>
          {dots?.map((dot: any) => <View key={dot.key} style={[styles.dot, { backgroundColor: dot.color }]} />)}
        </View>
        <Text style={[
            styles.dayText, 
            { color: selected ? '#000' : (state === 'disabled' ? '#555' : '#fff') }
          ]}>
          {date.day}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name="person-circle-outline" size={28} color="#fff" />
          <Text style={styles.headerTitle}>Христианский помощник</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Notification")}>
            <Icon name="notifications-outline" size={26} color="#fff" />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.calendarCard}>
            <Calendar
              dayComponent={CustomDay}
              markedDates={markedDates}
              monthFormat={"MMMM yyyy"}
              theme={{
                backgroundColor: "transparent",
                calendarBackground: "transparent",
                textSectionTitleColor: "#fff",
                monthTextColor: "#fff",
                arrowColor: "#fff",
                'stylesheet.calendar.main': {
                  container: {
                    backgroundColor: 'transparent'
                  }
                }
              }}
            />
            {isLoggedIn &&
              notes[selectedDate] &&
              Array.isArray(notes[selectedDate]) &&
              notes[selectedDate].map((n, index) => (
                <View key={index}>
                  <Text style={styles.savedNote}>
                    {n}
                  </Text>
                  {index < notes[selectedDate].length - 1 && <View style={styles.noteSeparator} />}
                </View>
              ))}
            {holiday && (
              <View style={styles.eventCard}>
                <Text style={styles.eventTitle}>{holiday.title}</Text>
                <Text style={styles.eventDescription}>
                  {holiday.description}
                </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
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
  noteContainer: {
    marginTop: 10,
    paddingBottom: 40,
    width: "90%",
    margin: "auto",
  },
  input: {
    width: "90%",
    margin: "auto",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    height: 80,
  },
  saveButton: {
    backgroundColor: "#ffb703",
    width: "90%",
    margin: "auto",
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
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  noteSeparator: {
    height: 1,
    backgroundColor: "#555",
    marginTop: 10,
  },
  dayContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 1,
  },
  dayText: {
    fontSize: 16,
    marginTop: 2, // to push the text down a bit from the dots
  },
});
