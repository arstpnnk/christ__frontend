import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../App";

type Reminder = {
  id: string;
  title: string;
  timeLabel: string;
  enabled: boolean;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState("");
  const [showAllReminders, setShowAllReminders] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "morning",
      title: "Утренняя молитва",
      timeLabel: "6:00 / 27 дек.",
      enabled: true,
    },
    {
      id: "evening",
      title: "Вечерняя молитва",
      timeLabel: "20:00 / 27 дек.",
      enabled: false,
    },
    {
      id: "food",
      title: "Молитва перед едой",
      timeLabel: "12:30 / 27 дек.",
      enabled: true,
    },
    {
      id: "psalms",
      title: "Чтение псалмов",
      timeLabel: "21:00 / 27 дек.",
      enabled: false,
    },
  ]);

  const favorites = useMemo(
    () => [
      {
        id: "fav_morning",
        title: "Утренняя молитва",
        icon: require("../файлы для новых экранов/иконки/иконка утреней молитвы.png"),
        borderColor: "#36C05B",
      },
      {
        id: "fav_evening",
        title: "Вечерняя молитва",
        icon: require("../файлы для новых экранов/иконки/иконка вечерней молитвы.png"),
        borderColor: "#E1C400",
      },
      {
        id: "fav_food",
        title: "Молитва перед едой",
        icon: require("../файлы для новых экранов/иконки/иконка молитва перед едой.png"),
        borderColor: "#4BAE8A",
      },
      {
        id: "fav_psalms",
        title: "Псалтирь",
        icon: require("../файлы для новых экранов/иконки/иконка вечерней молитвы.png"),
        borderColor: "#8AA3FF",
      },
    ],
    []
  );

  const baseCategories = useMemo(
    () => [
      {
        id: "cat_morning",
        title: "Утренняя\nмолитва",
        icon: require("../файлы для новых экранов/иконки/иконка утреней молитвы.png"),
        bg: "#456AA6",
      },
      {
        id: "cat_evening",
        title: "Вечерняя\nмолитва",
        icon: require("../файлы для новых экранов/иконки/иконка вечерней молитвы.png"),
        bg: "#2F4A86",
      },
      {
        id: "cat_food",
        title: "Молитва пе-\nред едой",
        icon: require("../файлы для новых экранов/иконки/иконка молитва перед едой.png"),
        bg: "#2C5B59",
      },
    ],
    []
  );

  const extraCategories = useMemo(
    () => [
      {
        id: "cat_psalms",
        title: "Псалтирь",
        icon: require("../файлы для новых экранов/иконки/иконка вечерней молитвы.png"),
        bg: "#3D4A7A",
      },
      {
        id: "cat_gratitude",
        title: "Благодарст-\nвенные",
        icon: require("../файлы для новых экранов/иконки/иконка утреней молитвы.png"),
        bg: "#6A5A2E",
      },
      {
        id: "cat_short",
        title: "Короткие\nмолитвы",
        icon: require("../файлы для новых экранов/иконки/иконка утреней молитвы.png"),
        bg: "#5C2C57",
      },
    ],
    []
  );

  const moreCategoryCard = useMemo(
    () => ({
      id: "cat_more",
      title: showAllCategories ? "Свернуть" : "Еще...",
      icon: require("../файлы для новых экранов/иконки/стрелка вниз обычно в кнопке ЕЩЕ.png"),
      bg: "#3D7A5E",
    }),
    [showAllCategories]
  );

  const categories = useMemo(() => {
    const expanded = showAllCategories
      ? [...baseCategories, ...extraCategories]
      : baseCategories;
    return [...expanded, moreCategoryCard];
  }, [baseCategories, extraCategories, moreCategoryCard, showAllCategories]);

  const libraryCards = useMemo(
    () => [
      {
        id: "bible",
        title: "Библия",
        image: require("../файлы для новых экранов/Библия.png"),
        large: true,
      },
      {
        id: "catechism",
        title: "Катехизис",
        image: require("../файлы для новых экранов/Катехизис.png"),
      },
      {
        id: "apocalypse",
        title: "Апокалипсис",
        image: require("../файлы для новых экранов/апокалипсис.png"),
      },
      {
        id: "service",
        title: "Служебник",
        image: require("../файлы для новых экранов/Служебник.png"),
      },
      {
        id: "psalter",
        title: "Псалтирь",
        image: require("../файлы для новых экранов/Псалтирь.png"),
      },
    ],
    []
  );

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const visibleReminders = showAllReminders ? reminders : reminders.slice(0, 2);
  const visibleFavorites = showAllFavorites ? favorites : favorites.slice(0, 2);

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      blurRadius={2}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.8}>
            <Ionicons name="person-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Христианский помощник</Text>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Notification")}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Поиск..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.searchInput}
            />
            <Image
              source={require("../файлы для новых экранов/иконки/иконка поиска.png")}
              style={styles.searchIcon}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>
            Напоминания о духовных практиках:
          </Text>

          {visibleReminders.map((item) => (
            <View key={item.id} style={styles.reminderCard}>
              <View style={styles.reminderText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.timeLabel}</Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleReminder(item.id)}
                activeOpacity={0.85}
                style={styles.toggleButton}
              >
                <Image
                  source={
                    item.enabled
                      ? require("../файлы для новых экранов/иконки/turn on.png")
                      : require("../файлы для новых экранов/иконки/turn off.png")
                  }
                  style={styles.toggleIcon}
                />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.moreButton}
            activeOpacity={0.85}
            onPress={() => setShowAllReminders((v) => !v)}
          >
            <Text style={styles.moreText}>
              {showAllReminders ? "Свернуть" : "Еще..."}
            </Text>
            <Image
              source={require("../файлы для новых экранов/иконки/стрелка вниз обычно в кнопке ЕЩЕ.png")}
              style={[
                styles.moreArrow,
                showAllReminders && styles.moreArrowExpanded,
              ]}
            />
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>
            Избранное:
          </Text>

          {visibleFavorites.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[styles.favoriteRow, { borderColor: item.borderColor }]}
            >
              <Text style={styles.favoriteText}>{item.title}</Text>
              <Image source={item.icon} style={styles.favoriteIcon} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.moreButton}
            activeOpacity={0.85}
            onPress={() => setShowAllFavorites((v) => !v)}
          >
            <Text style={styles.moreText}>
              {showAllFavorites ? "Свернуть" : "Еще..."}
            </Text>
            <Image
              source={require("../файлы для новых экранов/иконки/стрелка вниз обычно в кнопке ЕЩЕ.png")}
              style={[
                styles.moreArrow,
                showAllFavorites && styles.moreArrowExpanded,
              ]}
            />
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>
            Категории молитв:
          </Text>

          <View style={styles.categoryGrid}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.85}
                style={[styles.categoryCard, { backgroundColor: c.bg }]}
                onPress={
                  c.id === "cat_more"
                    ? () => setShowAllCategories((v) => !v)
                    : undefined
                }
              >
                <Text style={styles.categoryTitle}>{c.title}</Text>
                <Image source={c.icon} style={styles.categoryIcon} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.libraryHeader}>Библия</Text>

          <TouchableOpacity activeOpacity={0.9} style={styles.libraryBigCard}>
            <Image
              source={libraryCards[0].image}
              style={styles.libraryBigImage}
            />
            <View style={styles.libraryBigOverlay} />
            <Text style={styles.libraryBigTitle}>{libraryCards[0].title}</Text>
          </TouchableOpacity>

          <View style={styles.libraryGrid}>
            {libraryCards.slice(1).map((card) => (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.9}
                style={styles.librarySmallCard}
              >
                <Image source={card.image} style={styles.librarySmallImage} />
                <View style={styles.librarySmallOverlay} />
                <Text style={styles.librarySmallTitle}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.listenButton}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Sermons")}
          >
            <Text style={styles.listenText}>Слушать проповеди</Text>
            <Image
              source={require("../файлы для новых экранов/иконки/иконки слушать проповеди.png")}
              style={styles.listenIcon}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },

  header: {
    paddingTop: 44,
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  headerIconButton: { padding: 6 },

  searchRow: { paddingHorizontal: 14, paddingBottom: 8 },
  searchBox: {
    height: 40,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingLeft: 12,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 14, paddingVertical: 0 },
  searchIcon: { width: 20, height: 20, opacity: 0.9 },

  content: { paddingHorizontal: 14, paddingBottom: 110 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 8 },
  sectionSpacing: { marginTop: 18 },

  reminderCard: {
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reminderText: { flex: 1, paddingRight: 10 },
  cardTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  cardSubtitle: { color: "rgba(255,255,255,0.8)", marginTop: 2, fontSize: 12 },
  toggleButton: { padding: 6 },
  toggleIcon: { width: 42, height: 22 },

  moreButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  moreText: { color: "#fff", fontWeight: "700" },
  moreArrow: { width: 16, height: 16, opacity: 0.95 },
  moreArrowExpanded: { transform: [{ rotate: "180deg" }] },

  favoriteRow: {
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  favoriteText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  favoriteIcon: { width: 26, height: 26, opacity: 0.95 },

  categoryGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  categoryCard: {
    width: "48%",
    minHeight: 58,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryTitle: { color: "#fff", fontWeight: "700", fontSize: 13 },
  categoryIcon: { width: 26, height: 26, opacity: 0.95 },

  libraryHeader: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 22 },
  libraryBigCard: {
    marginTop: 8,
    borderRadius: 18,
    overflow: "hidden",
    height: 120,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  libraryBigImage: { width: "100%", height: "100%" },
  libraryBigOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  libraryBigTitle: {
    position: "absolute",
    left: 16,
    bottom: 14,
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },

  libraryGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  librarySmallCard: {
    width: "48%",
    height: 95,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  librarySmallImage: { width: "100%", height: "100%" },
  librarySmallOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  librarySmallTitle: {
    position: "absolute",
    left: 12,
    bottom: 10,
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },

  listenButton: {
    marginTop: 18,
    marginBottom: 20,
    backgroundColor: "rgba(132, 64, 132, 0.85)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listenText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  listenIcon: { width: 34, height: 18, opacity: 0.95 },
});
