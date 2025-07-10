// mobile/app/(tabs)/videos.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera, Search, UserCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VideosScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <Text className="text-3xl font-bold text-black">Reels</Text>
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
            <Camera size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
            <Search size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
            <UserCircle size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area Placeholder */}
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-500">Video content will appear here.</Text>
      </View>
    </View>
  );
};

export default VideosScreen;