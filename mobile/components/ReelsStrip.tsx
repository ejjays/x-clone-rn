import React, { useMemo } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { getPlayableVideoUrl, getVideoThumbnailUrl } from "@/utils/media";
import { Image as ExpoImage } from "expo-image";
import { usePosts } from "@/hooks/usePosts";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";

export default function ReelsStrip() {
  const { posts } = usePosts();
  const { colors } = useTheme();

  const videos = useMemo(() => posts.filter((p) => !!p.video), [posts]);
  if (videos.length === 0) return null;

  return (
    <View style={{ paddingVertical: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginTop: 8, marginBottom: 8 }}>
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>Reels</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {videos.slice(0, 12).map((item) => (
          <TouchableOpacity
            key={item._id}
            onPress={() => router.push({ pathname: "/(tabs)/videos", params: { videoId: item._id } } as any)}
            className="w-28 h-48 rounded-xl overflow-hidden"
            activeOpacity={0.8}
          >
            <View style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface }}>
              <ExpoImage
                source={{ uri: getVideoThumbnailUrl(item.video as string) || `${getPlayableVideoUrl(item.video as string)}` }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 6, backgroundColor: 'rgba(0,0,0,0.25)' }}>
                <Text numberOfLines={1} style={{ color: 'white', fontSize: 12 }}>
                  {item.content || `${item.user.firstName} ${item.user.lastName}`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

