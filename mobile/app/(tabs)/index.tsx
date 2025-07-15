// mobile/app/(tabs)/index.tsx
import PostsList from "@/components/PostsList"
import PostComposer from "@/components/PostComposer"
import { usePosts } from "@/hooks/usePosts"
import { useUserSync } from "@/hooks/useUserSync"
import { router } from "expo-router"
import { useState } from "react"
import { RefreshControl, ScrollView, View } from "react-native"

const HomeScreen = () => {
  const [isRefetching, setIsRefetching] = useState(false)
  const { refetch: refetchPosts } = usePosts()

  // This function now just navigates
  const handleOpenComments = (postId: string) => {
    router.push(`/post/${postId}`)
  }

  const handlePullToRefresh = async () => {
    setIsRefetching(true)
    await refetchPosts()
    setIsRefetching(false)
  }

  useUserSync()

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={handlePullToRefresh} colors={["#1877F2"]} tintColor="#1877F2" />
      }
    >
      <View className="bg-white">
        <PostComposer />
      </View>
      <View className="h-1.5 bg-gray-200" />
      <PostsList onOpenComments={handleOpenComments} />
    </ScrollView>
  )
}

export default HomeScreen