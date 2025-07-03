import "react-native-url-polyfill/auto"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://nhvjdsiurzxfhmeqpxky.supabase.co"
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odmpkc2l1cnp4ZmhtZXFweGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mzg2ODUsImV4cCI6MjA2NzExNDY4NX0.W2bv0mWlnJ77XYjXrdwQhgEc8BNNchh5Y-NOwQdP0Js"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Message {
  id: number
  text: string
  created_at: string
  user_id: string
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
