import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Image as ImageIcon } from "lucide-react-native";
import { View, Image, Text, TouchableOpacity, TextInput, Animated } from "react-native";
import { useEffect, useState, useRef } from 'react';

interface PostComposerProps {
  animatedPlaceholder?: boolean;
}

const PostComposer = ({ animatedPlaceholder }: PostComposerProps) => {
  const { user } = useUser();

  if (animatedPlaceholder) {
    const placeholderTexts = ["Share your thoughts with us...", "Tell us about your day", "Share your daily bible verse"];
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const intervalId = setInterval(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setPlaceholderIndex(prevIndex => (prevIndex + 1) % placeholderTexts.length);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        });
      }, 4000);

      return () => clearInterval(intervalId);
    }, [animatedPlaceholder]);

    return (
      <View className="p-4 bg-white">
        <View className="flex-row items-center">
          <Image
            source={{ uri: user?.imageUrl }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <Animated.View style={{ opacity: fadeAnim }} className="flex-1 bg-gray-100 rounded-full px-4 py-3">
            <TouchableOpacity
              onPress={() => router.push("/create-post")}
              activeOpacity={0.7}
            >
              <Text className="text-base text-gray-500">
                {placeholderTexts[placeholderIndex]}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity
            onPress={() => router.push("/create-post")}
            className="ml-4"
          >
            <ImageIcon size={24} color={"#4CAF50"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  } else {
    return (
      <View className="p-4 bg-white">
        <View className="flex-row items-center">
          <Image
            source={{ uri: user?.imageUrl }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <TouchableOpacity
            onPress={() => router.push("/create-post")}
            className="flex-1 bg-gray-100 rounded-full px-4 py-3"
            activeOpacity={0.7}
          >
            <Text className="text-base text-gray-500">
              Share your thoughts...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/create-post")}
            className="ml-4"
          >
            <ImageIcon size={24} color={"#4CAF50"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
};

export default PostComposer;
