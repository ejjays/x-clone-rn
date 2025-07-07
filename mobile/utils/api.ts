// mobile/utils/api.ts
import axios, { type AxiosInstance } from "axios"
import { useAuth } from "@clerk/clerk-expo"
import React from "react" // Import React to use useMemo

// --- Configuration ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL

if (!API_BASE_URL) {
  throw new Error("🔴 FATAL: EXPO_PUBLIC_API_URL is not defined. Please set it in your EAS Secrets.")
}

console.log(`✅ Initializing API with base URL: ${API_BASE_URL}`)

// --- API Client Creation ---
export const createApiClient = (getToken: () => Promise<string | null>): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  })

  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error("❌ Error retrieving auth token:", error)
    }
    return config
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("❌ API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.error || error.message,
      })
      return Promise.reject(error)
    },
  )

  return api
}

// --- Custom Hook with Memoization ---
export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth()
  return React.useMemo(() => createApiClient(getToken), [getToken])
}

// --- API Endpoint Definitions ---
export const userApi = {
  syncUser: (api: AxiosInstance) => api.post("/users/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  updateProfile: (api: AxiosInstance, data: any) => api.put("/users/profile", data),
  getAllUsers: (api: AxiosInstance) => api.get("/users/all"),
  followUser: (api: AxiosInstance, userId: string) => api.post(`/users/follow/${userId}`),
}

export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) => api.post("/posts", data),
  getPosts: (api: AxiosInstance) => api.get("/posts"),
  getPost: (api: AxiosInstance, postId: string) => api.get(`/posts/${postId}`), // NEW: Get single post
  getUserPosts: (api: AxiosInstance, username: string) => api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) => api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
}

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
  likeComment: (api: AxiosInstance, commentId: string) => api.post(`/comments/${commentId}/like`), // NEW: Like a comment
}

export const streamApi = {
  getToken: (api: AxiosInstance) => api.get("/stream/token"),
  createChannel: (api: AxiosInstance, data: { members: string[]; name?: string }) =>
    api.post("/stream/channel", data),
  getChannels: (api: AxiosInstance) => api.get("/stream/channels"),
}