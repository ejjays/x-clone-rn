"use client"

import LottieView from "lottie-react-native"
import { useRef } from "react"
import { Text, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"

const NoNotificationsFound = () => {
  const animationRef = useRef<LottieView>(null)

  // Only start animation when the notifications screen is focused
  useFocusEffect(
    useCallback(() => {
      // Start animation when screen comes into focus
      animationRef.current?.play()

      // Set up interval to loop animation every 4 seconds while screen is focused
      const interval = setInterval(() => {
        animationRef.current?.play()
      }, 4000)

      // Cleanup when screen loses focus
      return () => {
        clearInterval(interval)
        animationRef.current?.reset() // Reset animation when leaving screen
      }
    }, []),
  )

  return (
    <View className="flex-1 items-center justify-center px-8 bg-white" style={{ minHeight: 400 }}>
      <View className="items-center">
        {/* BIG Animated Lottie Bell - Main Highlight */}
        <View className="w-90 h-90 mb-8">
          <LottieView
            ref={animationRef}
            source={require("../assets/animations/empty-notifications.json")}
            style={{
              width: "100%",
              height: "100%",
            }}
            loop={false}
            autoPlay={false} // Don't auto-play, we control it manually
            speed={1.0}
            resizeMode="contain"
          />
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-4">No notifications yet</Text>
        <Text className="text-gray-500 text-center text-base leading-6 max-w-sm">
          When people like, comment, or follow you, you'll see it here.
        </Text>
      </View>
    </View>
  )
}

export default NoNotificationsFound
