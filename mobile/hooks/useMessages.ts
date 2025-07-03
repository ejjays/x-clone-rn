import { useState, useEffect } from "react"
import { useAuth } from "@clerk/clerk-expo"
import { supabase, type Message } from "@/lib/supabase"
import { Alert } from "react-native"

export const useMessages = (conversationId?: string) => {
  const { userId } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  console.log("🔄 useMessages hook initialized:", { conversationId, userId })

  // Fetch initial messages
  const fetchMessages = async (showRefreshing = false) => {
    if (!conversationId) {
      console.log("❌ No conversation ID provided")
      return
    }

    console.log("📥 Fetching messages for conversation:", conversationId)

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

      console.log("📥 Messages fetch result:", { data, error, count: data?.length })

      if (error) {
        console.error("❌ Error fetching messages:", error)
        Alert.alert("Error", `Failed to load messages: ${error.message}`)
      } else {
        setMessages(data || [])
        console.log("✅ Messages loaded successfully:", data?.length || 0)
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

    console.log("🔔 Setting up real-time subscription for conversation:", conversationId)

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
          console.log("🔔 Real-time message received:", payload)
          const newMessage = payload.new as Message

          // 🔥 FIX: Force UI update by creating new array reference
          setMessages((current) => {
            console.log("📝 Adding new message to current messages:", current.length)
            const updatedMessages = [...current, newMessage]
            console.log("📝 Updated messages count:", updatedMessages.length)
            return updatedMessages
          })
        },
      )
      .subscribe((status) => {
        console.log("🔔 Subscription status:", status)
      })

    return () => {
      console.log("🔕 Cleaning up subscription")
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  const sendMessage = async (text: string) => {
    if (!text.trim() || !userId || !conversationId) {
      console.log("❌ Cannot send message:", { text: text.trim(), userId, conversationId })
      return
    }

    console.log("📤 Sending message:", { text: text.trim(), userId, conversationId })
    setIsSending(true)

    try {
      const messageData = {
        text: text.trim(),
        user_id: userId,
        conversation_id: Number.parseInt(conversationId),
      }

      console.log("📤 Message data:", messageData)

      const { data, error } = await supabase.from("messages").insert([messageData]).select()

      console.log("📤 Send result:", { data, error })

      if (error) {
        console.error("❌ Error sending message:", error)
        Alert.alert("Error", `Failed to send message: ${error.message}`)
      } else {
        console.log("✅ Message sent successfully:", data)

        // 🔥 FIX: Immediately add to local state for instant feedback
        if (data && data[0]) {
          setMessages((current) => [...current, data[0]])
        }
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
