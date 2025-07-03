import { useState, useEffect } from "react"
import { useAuth } from "@clerk/clerk-expo"
import { supabase, type Conversation } from "@/lib/supabase"
import { Alert } from "react-native"
import { useCurrentUser } from "./useCurrentUser"

export const useConversations = () => {
  const { userId } = useAuth()
  const { currentUser } = useCurrentUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchConversations = async (showRefreshing = false) => {
    if (!userId || !currentUser?._id) {
      return
    }

    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      // 🔥 FIX: Use ONLY MongoDB IDs for consistency
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${currentUser._id},participant_2.eq.${currentUser._id}`)
        .order("last_message_at", { ascending: false })

      if (error) {
        console.error("❌ Error fetching conversations:", error)
        Alert.alert("Error", `Failed to load conversations: ${error.message}`)
      } else {
        setConversations(data || [])
      }
    } catch (error) {
      console.error("❌ Exception fetching conversations:", error)
      Alert.alert("Error", "Failed to load conversations")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (currentUser?._id) {
      fetchConversations()
    }
  }, [userId, currentUser?._id])

  const createConversation = async (otherUserMongoId: string) => {
    if (!currentUser?._id) {
      return null
    }

    try {
      // 🔥 FIX: Use ONLY MongoDB IDs and check both directions
      const { data: existing, error: searchError } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(participant_1.eq.${currentUser._id},participant_2.eq.${otherUserMongoId}),` +
            `and(participant_1.eq.${otherUserMongoId},participant_2.eq.${currentUser._id})`,
        )
        .maybeSingle()

      if (searchError && searchError.code !== "PGRST116") {
        console.error("❌ Error checking existing conversation:", searchError)
        Alert.alert("Error", `Failed to check existing conversation: ${searchError.message}`)
        return null
      }

      if (existing) {
        return existing.id
      }

      // 🔥 FIX: Create new conversation using ONLY MongoDB IDs
      const conversationData = {
        participant_1: currentUser._id, // MongoDB ID
        participant_2: otherUserMongoId, // MongoDB ID
      }

      const { data, error } = await supabase.from("conversations").insert([conversationData]).select().single()

      if (error) {
        console.error("❌ Error creating conversation:", error)
        Alert.alert("Error", `Failed to create conversation: ${error.message}`)
        return null
      }

      fetchConversations()
      return data.id
    } catch (error) {
      console.error("❌ Exception creating conversation:", error)
      Alert.alert("Error", "Failed to create conversation")
      return null
    }
  }

  const refreshConversations = () => {
    fetchConversations(true)
  }

  return {
    conversations,
    isLoading,
    isRefreshing,
    createConversation,
    refreshConversations,
  }
}
