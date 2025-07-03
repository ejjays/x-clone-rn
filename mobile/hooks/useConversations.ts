import { useState, useEffect } from "react"
import { useAuth } from "@clerk/clerk-expo"
import { supabase, type Conversation } from "@/lib/supabase"
import { Alert } from "react-native"

export const useConversations = () => {
  const { userId } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchConversations = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
          .order("last_message_at", { ascending: false })

        if (error) {
          console.error("Error fetching conversations:", error)
          Alert.alert("Error", "Failed to load conversations")
        } else {
          setConversations(data || [])
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
        Alert.alert("Error", "Failed to load conversations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [userId])

  const createConversation = async (otherUserId: string) => {
    if (!userId) return null

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`,
        )
        .single()

      if (existing) {
        return existing.id
      }

      // Create new conversation
      const { data, error } = await supabase
        .from("conversations")
        .insert([
          {
            participant_1: userId,
            participant_2: otherUserId,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating conversation:", error)
        Alert.alert("Error", "Failed to create conversation")
        return null
      }

      return data.id
    } catch (error) {
      console.error("Error creating conversation:", error)
      Alert.alert("Error", "Failed to create conversation")
      return null
    }
  }

  return {
    conversations,
    isLoading,
    createConversation,
  }
}
