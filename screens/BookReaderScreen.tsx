import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../App";

type BookReaderRoute = RouteProp<RootStackParamList, "BookReader">;

type Bookmark = {
  id: string;
  pageIndex: number;
  lineIndex: number;
  preview: string;
  createdAt: number;
};

const sampleBibleGenesis1 = [
  "1. В начале сотворил Бог небо и землю.",
  "2. Земля же была безвидна и пуста, и тьма над бездною, и Дух Божий носился над водою.",
  "3. И сказал Бог: да будет свет. И стал свет.",
  "4. И увидел Бог свет, что он хорош, и отделил Бог свет от тьмы.",
  "5. И назвал Бог свет днем, а тьму ночью. И был вечер, и было утро: день один.",
  "6. И сказал Бог: да будет твердь посреди воды, и да отделяет она воду от воды.",
  "7. И создал Бог твердь, и отделил воду, которая под твердью, от воды, которая над твердью. И стало так.",
  "8. И назвал Бог твердь небом. И был вечер, и было утро: день второй.",
  "9. И сказал Бог: да соберется вода, которая под небом, в одно место, и да явится суша. И стало так.",
  "10. И назвал Бог сушу землею, а собрание вод назвал морями. И увидел Бог, что это хорошо.",
  "11. И сказал Бог: да произрастит земля зелень, траву, сеющую семя, и дерево плодовитое, приносящее по роду своему плод, в котором семя его на земле. И стало так.",
  "12. И произвела земля зелень, траву, сеющую семя по роду ее, и дерево, приносящее плод, в котором семя его по роду его. И увидел Бог, что это хорошо.",
  "13. И был вечер, и было утро: день третий.",
  "14. И сказал Бог: да будут светила на тверди небесной для отделения дня от ночи, и для знамений, и времен, и дней, и годов;",
  "15. и да будут они светильниками на тверди небесной, чтобы светить на землю. И стало так.",
  "16. И создал Бог два светила великие: светило большее, для управления днем, и светило меньшее, для управления ночью, и звезды;",
  "17. и поставил их Бог на тверди небесной, чтобы светить на землю,",
  "18. и управлять днем и ночью, и отделять свет от тьмы. И увидел Бог, что это хорошо.",
  "19. И был вечер, и было утро: день четвертый.",
  "20. И сказал Бог: да произведет вода пресмыкающихся, душу живую; и птицы да полетят над землею, по тверди небесной.",
  "21. И сотворил Бог рыб больших и всякую душу животных пресмыкающихся, которых произвела вода, по роду их, и всякую птицу пернатую по роду ее. И увидел Бог, что это хорошо.",
  "22. И благословил их Бог, говоря: плодитесь и размножайтесь, и наполняйте воды в морях, и птицы да размножаются на земле.",
  "23. И был вечер, и было утро: день пятый.",
  "24. И сказал Бог: да произведет земля душу живую по роду ее, скотов, и гадов, и зверей земных по роду их. И стало так.",
  "25. И создал Бог зверей земных по роду их, и скотов по роду их, и всех гадов земных по роду их. И увидел Бог, что это хорошо.",
  "26. И сказал Бог: сотворим человека по образу Нашему и по подобию Нашему; и да владычествуют они над рыбами морскими, и над птицами небесными, и над скотом, и над всею землею, и над всеми гадами, пресмыкающимися по земле.",
  "27. И сотворил Бог человека по образу Своему, по образу Божию сотворил его; мужчину и женщину сотворил их.",
  "28. И благословил их Бог, и сказал им Бог: плодитесь и размножайтесь, и наполняйте землю, и обладайте ею, и владычествуйте над рыбами морскими, и над птицами небесными, и над всяким животным, пресмыкающимся по земле.",
  "29. И сказал Бог: вот, Я дал вам всякую траву, сеющую семя, какая есть на всей земле, и всякое дерево, у которого плод древесный, сеющий семя; вам сие будет в пищу;",
  "30. а всем зверям земным, и всем птицам небесным, и всякому пресмыкающемуся по земле, в котором душа живая, дал Я всю зелень травную в пищу. И стало так.",
  "31. И увидел Бог всё, что Он создал, и вот, хорошо весьма. И был вечер, и было утро: день шестой.",
];

const PAGE_SIZE = 10;
const screenWidth = Dimensions.get("window").width;

export default function BookReaderScreen({ route }: { route: BookReaderRoute }) {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [highlight, setHighlight] = useState<{ pageIndex: number; lineIndex: number } | null>(null);
  const slideX = useRef(new Animated.Value(screenWidth)).current;

  const { bookId } = route.params;

  const bookmarksKey = useMemo(() => `bookmarks_${bookId}`, [bookId]);

  const { headerTitle, lines } = useMemo(() => {
    if (bookId === "bible") {
      return { headerTitle: "Книга Бытие. Глава 1", lines: sampleBibleGenesis1 };
    }
    if (bookId === "psalter") {
      return { headerTitle: "Псалтирь (пример)", lines: ["Текст будет добавлен позже."] };
    }
    if (bookId === "catechism") {
      return { headerTitle: "Катехизис (пример)", lines: ["Текст будет добавлен позже."] };
    }
    if (bookId === "apocalypse") {
      return { headerTitle: "Апокалипсис (пример)", lines: ["Текст будет добавлен позже."] };
    }
    if (bookId === "service") {
      return { headerTitle: "Служебник (пример)", lines: ["Текст будет добавлен позже."] };
    }
    return { headerTitle: "Книга", lines: ["Текст будет добавлен позже."] };
  }, [bookId]);

  const filteredLines = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lines;
    return lines.filter((x) => x.toLowerCase().includes(q));
  }, [lines, search]);

  const pages = useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < lines.length; i += PAGE_SIZE) {
      result.push(lines.slice(i, i + PAGE_SIZE));
    }
    return result.length ? result : [[]];
  }, [lines]);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem(bookmarksKey);
      if (!raw) {
        setBookmarks([]);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setBookmarks(parsed);
        else setBookmarks([]);
      } catch {
        setBookmarks([]);
      }
    };
    load();
  }, [bookmarksKey]);

  useEffect(() => {
    Animated.timing(slideX, {
      toValue: bookmarksOpen ? 0 : screenWidth,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [bookmarksOpen, slideX]);

  const persistBookmarks = async (next: Bookmark[]) => {
    setBookmarks(next);
    await AsyncStorage.setItem(bookmarksKey, JSON.stringify(next));
  };

  const addBookmark = async (pIndex: number, lIndex: number, line: string) => {
    const id = `${bookId}_${pIndex}_${lIndex}`;
    if (bookmarks.some((b) => b.id === id)) return;
    const next: Bookmark[] = [
      { id, pageIndex: pIndex, lineIndex: lIndex, preview: line, createdAt: Date.now() },
      ...bookmarks,
    ];
    await persistBookmarks(next);
    setHighlight({ pageIndex: pIndex, lineIndex: lIndex });
  };

  const removeBookmark = async (id: string) => {
    const next = bookmarks.filter((b) => b.id !== id);
    await persistBookmarks(next);
  };

  const openBookmarkMenu = (pIndex: number, lIndex: number, line: string) => {
    const id = `${bookId}_${pIndex}_${lIndex}`;
    const exists = bookmarks.some((b) => b.id === id);
    Alert.alert("Закладка", line, [
      exists
        ? { text: "Убрать закладку", style: "destructive", onPress: () => removeBookmark(id) }
        : { text: "Поставить закладку", onPress: () => addBookmark(pIndex, lIndex, line) },
      { text: "Отмена", style: "cancel" },
    ]);
  };

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      blurRadius={2}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

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

          <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.8}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBookmarksOpen(true)}
            >
              <Ionicons name="bookmark-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{headerTitle}</Text>
          {!search.trim() && (
            <Text style={styles.pageHint}>
              {pages.length > 0 ? `Стр. ${pageIndex + 1}/${pages.length}` : ""}
            </Text>
          )}
        </View>

        {search.trim() ? (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.textCard}>
              {filteredLines.map((line, idx) => (
                <Text key={`${idx}-${line}`} style={styles.line}>
                  {line}
                </Text>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const nextIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setPageIndex(nextIndex);
            }}
          >
            {pages.map((pageLines, pIndex) => (
              <View key={`page-${pIndex}`} style={{ width: screenWidth }}>
                <ScrollView contentContainerStyle={styles.content}>
                  <View style={styles.textCard}>
                    {pageLines.map((line, lIndex) => (
                      <Text
                        key={`${pIndex}-${lIndex}-${line}`}
                        style={[
                          styles.line,
                          highlight?.pageIndex === pIndex &&
                            highlight?.lineIndex === lIndex &&
                            styles.lineHighlighted,
                        ]}
                        onLongPress={() => openBookmarkMenu(pIndex, lIndex, line)}
                      >
                        {line}
                      </Text>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        )}

        <Modal
          transparent
          visible={bookmarksOpen}
          animationType="none"
          onRequestClose={() => setBookmarksOpen(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setBookmarksOpen(false)} />
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideX }] }]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Закладки</Text>
              <TouchableOpacity onPress={() => setBookmarksOpen(false)} activeOpacity={0.8}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {bookmarks.length === 0 ? (
              <Text style={styles.drawerEmpty}>Закладок пока нет</Text>
            ) : (
              <ScrollView>
                {bookmarks.map((b) => (
                  <View key={b.id} style={styles.bookmarkRow}>
                    <TouchableOpacity
                      style={styles.bookmarkMain}
                      activeOpacity={0.85}
                      onPress={() => {
                        setBookmarksOpen(false);
                        setHighlight({ pageIndex: b.pageIndex, lineIndex: b.lineIndex });
                        setPageIndex(b.pageIndex);
                      }}
                    >
                      <Text style={styles.bookmarkText} numberOfLines={2}>
                        {b.preview}
                      </Text>
                      <Text style={styles.bookmarkMeta}>
                        Стр. {b.pageIndex + 1}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeBookmark(b.id)}
                      activeOpacity={0.85}
                      style={styles.bookmarkDelete}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", paddingTop: 46 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flex: 1,
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

  titleRow: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 8 },
  title: { color: "#fff", fontSize: 16, fontWeight: "800" },
  pageHint: { color: "rgba(255,255,255,0.7)", marginTop: 4, fontSize: 12, fontWeight: "700" },

  content: { paddingHorizontal: 14, paddingBottom: 110 },
  textCard: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  line: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  lineHighlighted: {
    backgroundColor: "rgba(209, 178, 103, 0.18)",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },

  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: Math.min(320, screenWidth * 0.82),
    backgroundColor: "rgba(0,0,0,0.82)",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingTop: 46,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingBottom: 10,
  },
  drawerTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  drawerEmpty: { color: "rgba(255,255,255,0.75)", paddingHorizontal: 6, marginTop: 10 },
  bookmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  bookmarkMain: { flex: 1 },
  bookmarkText: { color: "#fff", fontWeight: "700" },
  bookmarkMeta: { color: "rgba(255,255,255,0.7)", marginTop: 6, fontSize: 12 },
  bookmarkDelete: { padding: 6 },
});
