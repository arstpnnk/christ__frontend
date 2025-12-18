import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SermonItem = {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  audio: number;
};

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function SermonsScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");

  const soundRef = useRef<Audio.Sound | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [barWidth, setBarWidth] = useState(1);

  const items: SermonItem[] = useMemo(
    () => [
      {
        id: "sermon_13",
        title: "Закон и любовь",
        subtitle: "Локальный файл",
        audio: require("../файлы для новых экранов/Проповеди/13-zakon-i-lubov.mp3"),
      },
      {
        id: "sermon_18",
        title: "Архангел Гавриил",
        subtitle: "Локальный файл",
        audio: require("../файлы для новых экранов/Проповеди/18-arhangel-gavriil.mp3"),
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((x) => x.title.toLowerCase().includes(query));
  }, [items, search]);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, []);

  const attachStatusUpdate = (sound: Audio.Sound) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      setIsPlaying(status.isPlaying);
      setPositionMs(status.positionMillis ?? 0);
      setDurationMs(status.durationMillis ?? 0);
    });
  };

  const loadAndPlay = async (item: SermonItem) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        item.audio,
        { shouldPlay: true },
        undefined,
        true
      );
      soundRef.current = sound;
      attachStatusUpdate(sound);
      setActiveId(item.id);
    } catch {
      setActiveId(null);
      setIsPlaying(false);
    }
  };

  const togglePlay = async (item: SermonItem) => {
    try {
      if (activeId !== item.id || !soundRef.current) {
        await loadAndPlay(item);
        return;
      }
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) await soundRef.current.pauseAsync();
      else await soundRef.current.playAsync();
    } catch {}
  };

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(Math.max(1, e.nativeEvent.layout.width));
  };

  const seekTo = async (ratio: number) => {
    if (!soundRef.current) return;
    const next = Math.max(0, Math.min(1, ratio)) * (durationMs || 0);
    try {
      await soundRef.current.setPositionAsync(Math.floor(next));
    } catch {}
  };

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      blurRadius={2}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
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
        </View>

        <View style={styles.list}>
          {filtered.map((item, idx) => {
            const isActive = activeId === item.id;
            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  idx % 2 === 0 ? styles.cardPurple : styles.cardGreen,
                ]}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {!!item.subtitle && (
                      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    )}
                    {!!item.date && (
                      <Text style={styles.cardDate}>{item.date}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => togglePlay(item)}
                    activeOpacity={0.85}
                    style={styles.playButton}
                  >
                    <Ionicons
                      name={isActive && isPlaying ? "pause" : "play"}
                      size={22}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>

                {isActive && (
                  <View style={styles.progressBlock}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.progressBar}
                      onLayout={onBarLayout}
                      onPress={(e) => seekTo(e.nativeEvent.locationX / barWidth)}
                    >
                      <View style={styles.progressTrack} />
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.round(progress * 100)}%` },
                        ]}
                      />
                      <View
                        style={[
                          styles.progressThumb,
                          {
                            left: Math.max(
                              0,
                              Math.min(barWidth - 12, barWidth * progress - 6)
                            ),
                          },
                        ]}
                      />
                    </TouchableOpacity>

                    <View style={styles.timeRow}>
                      <Text style={styles.timeText}>
                        {formatTime(positionMs)}
                      </Text>
                      <Text style={styles.timeText}>
                        {durationMs > 0 ? formatTime(durationMs) : "--:--"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", paddingTop: 46 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  backButton: {
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

  list: { paddingHorizontal: 14, gap: 14 },
  card: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: "rgba(120, 60, 140, 0.75)",
  },
  cardPurple: { backgroundColor: "rgba(132, 64, 132, 0.78)" },
  cardGreen: { backgroundColor: "rgba(86, 122, 94, 0.78)" },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardText: { flex: 1 },
  cardTitle: { color: "#fff", fontWeight: "800", fontSize: 14 },
  cardSubtitle: { color: "rgba(255,255,255,0.85)", marginTop: 6, fontSize: 12 },
  cardDate: { color: "rgba(255,255,255,0.75)", marginTop: 2, fontSize: 12 },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  progressBlock: { marginTop: 12 },
  progressBar: { height: 26, justifyContent: "center" },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1B267",
  },
  progressThumb: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D1B267",
  },
  timeRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700" },
});

