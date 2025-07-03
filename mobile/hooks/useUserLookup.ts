import { useState, useEffect } from "react"
import { useApiClient } from "@/utils/api"
import type { User } from "@/types"

// Cache to store user data and avoid repeated API calls
const userCache = new Map<string, User>()

export const useUserLookup = () => {
  const api = useApiClient()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch all users once and cache them
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (userCache.size > 0) return // Already cached

      setIsLoading(true)
      try {
        const response = await api.get("/users/all")
        const allUsers = response.data.users

        // Cache all users by their MongoDB ID
        allUsers.forEach((user: User) => {
          userCache.set(user._id, user)
        })

        setUsers(allUsers)
      } catch (error) {
        console.error("❌ Failed to fetch users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllUsers()
  }, [])

  const getUserById = (userId: string): User | null => {
    return userCache.get(userId) || null
  }

  const getUserDisplayInfo = (userId: string) => {
    const user = getUserById(userId)

    if (user) {
      return {
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        avatar:
          user.profilePicture ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=1877F2&color=fff&size=120`,
        verified: false,
      }
    }

    // Fallback for unknown users
    return {
      name: `User ${userId.slice(-6)}`,
      username: `user${userId.slice(-6)}`,
      avatar: `https://ui-avatars.com/api/?name=User&background=1877F2&color=fff&size=120`,
      verified: false,
    }
  }

  return {
    users,
    isLoading,
    getUserById,
    getUserDisplayInfo,
  }
}
