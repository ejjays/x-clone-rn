import { useState, useEffect } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { supabase, type Message } from "@/lib/supabase"
import { Alert } from "react-native"

export const useMessages = (conversationId?: string) => {
  const { currentUser } = useCurrentUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchMessages = async (showRefreshing = false) => {
    if (!conversationId) {
      return
    }

    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("❌ Error fetching messages:", error)
        Alert.alert("Error", `Failed to load messages: ${error.message}`)
      } else {
        setMessages(data || [])
      }
    } catch (error) {
      console.error("❌ Exception fetching messages:", error)
      Alert.alert("Error", "Failed to load messages")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [conversationId])

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((current) => [...current, newMessage])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  const sendMessage = async (text: string) => {
    if (!text.trim() || !currentUser?._id || !conversationId) {
      return
    }

    setIsSending(true)

    try {
      // 🔥 FIX: Use MongoDB ID for user_id
      const messageData = {
        text: text.trim(),
        user_id: currentUser._id, // Use MongoDB ID
        conversation_id: Number.parseInt(conversationId),
      }

      const { data, error } = await supabase.from("messages").insert([messageData]).select()

      if (error) {
        console.error("❌ Error sending message:", error)
        Alert.alert("Error", `Failed to send message: ${error.message}`)
      } else if (data && data[0]) {
        // Immediately add to local state for instant feedback
        setMessages((current) => [...current, data[0]])
      }
    } catch (error) {
      console.error("❌ Exception sending message:", error)
      Alert.alert("Error", "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const refreshMessages = () => {
    fetchMessages(true)
  }

  return {
    messages,
    isLoading,
    isSending,
    isRefreshing,
    sendMessage,
    refreshMessages,
  }
}
