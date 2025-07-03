import { useState, useEffect } from "react"
import { useAuth } from "@clerk/clerk-expo"
import { supabase, type Conversation } from "@/lib/supabase"
import { Alert } from "react-native"

export const useConversations = () => {
  const { userId } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  console.log("🔄 useConversations hook initialized:", { userId })

  const fetchConversations = async (showRefreshing = false) => {
    if (!userId) {
      console.log("❌ No user ID provided")
      return
    }

    console.log("📥 Fetching conversations for user:", userId)

    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order("last_message_at", { ascending: false })

      console.log("📥 Conversations fetch result:", { data, error, count: data?.length })

      if (error) {
        console.error("❌ Error fetching conversations:", error)
        Alert.alert("Error", `Failed to load conversations: ${error.message}`)
      } else {
        setConversations(data || [])
        console.log("✅ Conversations loaded successfully:", data?.length || 0)
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
    fetchConversations()
  }, [userId])

  const createConversation = async (otherUserId: string) => {
    if (!userId) {
      console.log("❌ No user ID for creating conversation")
      return null
    }

    console.log("🆕 Creating conversation:", { userId, otherUserId })

    try {
      // Check if conversation already exists
      const { data: existing, error: searchError } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`,
        )
        .maybeSingle()

      console.log("🔍 Existing conversation check:", { existing, searchError })

      if (searchError && searchError.code !== "PGRST116") {
        console.error("❌ Error checking existing conversation:", searchError)
        Alert.alert("Error", `Failed to check existing conversation: ${searchError.message}`)
        return null
      }

      if (existing) {
        console.log("✅ Found existing conversation:", existing.id)
        return existing.id
      }

      // Create new conversation
      const conversationData = {
        participant_1: userId,
        participant_2: otherUserId,
      }

      console.log("🆕 Creating new conversation with data:", conversationData)

      const { data, error } = await supabase.from("conversations").insert([conversationData]).select().single()

      console.log("🆕 Create conversation result:", { data, error })

      if (error) {
        console.error("❌ Error creating conversation:", error)
        Alert.alert("Error", `Failed to create conversation: ${error.message}`)
        return null
      }

      console.log("✅ Conversation created successfully:", data.id)
      // Refresh conversations list
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
