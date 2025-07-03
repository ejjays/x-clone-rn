// 🗑️ This file is no longer needed with Stream Chat
// All conversation data is now handled by Stream Chat
// You can delete this file or keep it for reference

export type MessageType = {
  id: number
  text: string
  fromUser: boolean
  timestamp: Date
  time: string
}

export type ConversationType = {
  id: number
  user: {
    name: string
    username: string
    avatar: string
    verified: boolean
  }
  lastMessage: string
  time: string
  timestamp: Date
  messages: MessageType[]
}

// 📝 NOTE: This mock data is no longer used
// Stream Chat handles all conversation data automatically
export const CONVERSATIONS: ConversationType[] = []
