import React, { useMemo } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
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
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 }}>
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>Reels</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
        {videos.slice(0, 12).map((item) => (
          <TouchableOpacity
            key={item._id}
            onPress={() => router.push({ pathname: "/(tabs)/videos", params: { videoId: item._id } } as any)}
            style={{ marginHorizontal: 6 }}
            activeOpacity={0.8}
          >
            <View style={{ width: 100, height: 160, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface }}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Image
                  source={{ uri: item.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user.firstName + ' ' + item.user.lastName)}` }}
                  style={{ width: '100%', height: '100%', opacity: 0.8 }}
                  resizeMode="cover"
                />
              )}
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

