"use client"

import LottieView from "lottie-react-native"
import { useEffect, useRef } from "react"
import { Text, View } from "react-native"

const NoNotificationsFound = () => {
  const animationRef = useRef<LottieView>(null)

  useEffect(() => {
    // Start the animation when component mounts
    animationRef.current?.play()

    // Optional: Loop the animation every 3 seconds
    const interval = setInterval(() => {
      animationRef.current?.play()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <View className="flex-1 items-center justify-center px-8 bg-white" style={{ minHeight: 400 }}>
      <View className="items-center">
        {/* Animated Lottie Bell */}
        <View className="w-32 h-32 mb-6">
          <LottieView
            ref={animationRef}
            source={require("../assets/animations/empty-notifications.json")}
            style={{
              width: "100%",
              height: "100%",
            }}
            loop={false}
            autoPlay={true}
            speed={1.2}
          />
        </View>

        <Text className="text-xl font-semibold text-gray-900 mb-3">No notifications yet</Text>
        <Text className="text-gray-500 text-center text-base leading-6 max-w-xs">
          When people like, comment, or follow you, you'll see it here.
        </Text>
      </View>
    </View>
  )
}

export default NoNotificationsFound
