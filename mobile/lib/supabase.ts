import "react-native-url-polyfill/auto"
import { createClient } from "@supabase/supabase-js"

// Replace these with your actual Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL 
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY 

console.log("🔧 Supabase Config:", {
  url: supabaseUrl,
  key: supabaseAnonKey ? "✅ Key exists" : "❌ No key",
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auth since we're using Clerk
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Test connection
supabase
  .from("conversations")
  .select("count", { count: "exact", head: true })
  .then(({ error, count }) => {
    if (error) {
      console.error("❌ Supabase connection failed:", error)
    } else {
      console.log("✅ Supabase connected successfully! Conversations count:", count)
    }
  })

// Database types
export interface Message {
  id: number
  text: string
  created_at: string
  user_id: string
  conversation_id: number
  user_name?: string
  user_avatar?: string
}

export interface Conversation {
  id: number
  created_at: string
  participant_1: string
  participant_2: string
  last_message?: string
  last_message_at?: string
}
