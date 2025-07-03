import axios, { type AxiosInstance, type AxiosResponse } from "axios"
import { useAuth } from "@clerk/clerk-expo"
import { useMemo } from "react"

export const API_BASE_URL = "https://x-clone-rn-one.vercel.app/api"

export interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
}

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth()

  return useMemo(() => {
    const client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    })

    client.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log("🔑 API Request:", {
              method: config.method?.toUpperCase(),
              url: config.url,
              hasToken: !!token,
            })
          }
        } catch (error) {
          console.error("❌ Failed to get auth token:", error)
        }
        return config
      },
      (error) => {
        console.error("❌ Request interceptor error:", error)
        return Promise.reject(error)
      },
    )

    client.interceptors.response.use(
      (response) => {
        console.log("✅ API Response:", {
          status: response.status,
          url: response.config.url,
        })
        return response
      },
      (error) => {
        const errorInfo = {
          status: error.response?.status,
          url: error.config?.url,
          message: error.response?.data?.error || error.message,
        }
        console.error("❌ API Error:", errorInfo)
        return Promise.reject(error)
      },
    )

    return client
  }, [getToken])
}

// User API
export const userApi = {
  me: (client: AxiosInstance): Promise<AxiosResponse<any>> => client.get("/users/me"),
  sync: (client: AxiosInstance): Promise<AxiosResponse<any>> => client.post("/users/sync"),
  all: (client: AxiosInstance): Promise<AxiosResponse<any>> => client.get("/users/all"),
  profile: (client: AxiosInstance, username: string): Promise<AxiosResponse<any>> =>
    client.get(`/users/profile/${username}`),
}

// Post API
export const postApi = {
  getAll: (client: AxiosInstance): Promise<AxiosResponse<any>> => client.get("/posts"),
  getByUser: (client: AxiosInstance, username: string): Promise<AxiosResponse<any>> =>
    client.get(`/posts/user/${username}`),
  create: (client: AxiosInstance, data: any): Promise<AxiosResponse<any>> => client.post("/posts", data),
  like: (client: AxiosInstance, postId: string): Promise<AxiosResponse<any>> => client.post(`/posts/${postId}/like`),
  unlike: (client: AxiosInstance, postId: string): Promise<AxiosResponse<any>> =>
    client.delete(`/posts/${postId}/like`),
}

// Comment API
export const commentApi = {
  getByPost: (client: AxiosInstance, postId: string): Promise<AxiosResponse<any>> => client.get(`/comments/${postId}`),
  create: (client: AxiosInstance, data: any): Promise<AxiosResponse<any>> => client.post("/comments", data),
}

// Notification API
export const notificationApi = {
  getAll: (client: AxiosInstance): Promise<AxiosResponse<any>> => client.get("/notifications"),
  markAsRead: (client: AxiosInstance, notificationId: string): Promise<AxiosResponse<any>> =>
    client.patch(`/notifications/${notificationId}/read`),
}

// Stream Chat API
export const streamApi = {
  getToken: (client: AxiosInstance): Promise<AxiosResponse<{ token: string; user: any }>> =>
    client.get("/stream/token"),
  createChannel: (
    client: AxiosInstance,
    data: { members: string[]; name?: string; type?: string },
  ): Promise<AxiosResponse<{ channelId: string }>> => client.post("/stream/channel", data),
  getChannels: (client: AxiosInstance): Promise<AxiosResponse<{ channels: any[] }>> => client.get("/stream/channels"),
  sendMessage: (client: AxiosInstance, channelId: string, data: { text: string }): Promise<AxiosResponse<any>> =>
    client.post(`/stream/channel/${channelId}/message`, data),
}
