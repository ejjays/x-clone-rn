import { useState, useEffect } from "react"
import { useAuth } from "@clerk/clerk-expo"
import { supabase, type Message } from "@/lib/supabase"
import { Alert } from "react-native"

export const useMessages = (conversationId?: string) => {
  const { userId } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  // Fetch initial messages
  useEffect(() => {
    if (!conversationId) return

    const fetchMessages = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Error fetching messages:", error)
          Alert.alert("Error", "Failed to load messages")
        } else {
          setMessages(data || [])
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        Alert.alert("Error", "Failed to load messages")
      } finally {
        setIsLoading(false)
      }
    }

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
    if (!text.trim() || !userId || !conversationId) return

    setIsSending(true)
    try {
      const { error } = await supabase.from("messages").insert([
        {
          text: text.trim(),
          user_id: userId,
          conversation_id: conversationId,
        },
      ])

      if (error) {
        console.error("Error sending message:", error)
        Alert.alert("Error", "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Error", "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
  }
}
