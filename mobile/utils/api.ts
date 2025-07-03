import axios, { type AxiosResponse } from "axios"
import { useAuth } from "@clerk/clerk-expo"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api"

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { getToken } = useAuth()
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log API requests
    console.log("🔑 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token,
    })

    return config
  },
  (error) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
    })
    return response
  },
  (error) => {
    const errorInfo = {
      message: error.response?.data || error.message,
      status: error.response?.status,
      url: error.config?.url,
    }

    console.error("❌ API Error:", errorInfo)
    return Promise.reject(error)
  },
)

// Generic API function
const apiRequest = async <T>(
  method: 'GET\' | 'POST' | 'PUT' | 'DELETE',\
  endpoint: string,\
  data?: any\
): Promise<T> => {
try {
  \
  const response: AxiosResponse<T> = await apiClient.request({
    method,
    url: endpoint,
    data,
  })
  return response.data;
} catch (error) {
  throw error
}
}
\
// User API
export const userApi = {
  getMe: () => apiRequest<any>("GET", "/users/me"),
  getAllUsers: () => apiRequest<any[]>("GET", "/users/all"),
  syncUser: () => apiRequest<any>("POST", "/users/sync"),
  getUserByUsername: (username: string) => apiRequest<any>("GET", `/users/${username}`),
  updateProfile: (data: any) => apiRequest<any>("PUT", "/users/profile", data),
}

// Post API
export const postApi = {
  getAllPosts: () => apiRequest<any[]>("GET", "/posts"),
  getUserPosts: (username: string) => apiRequest<any[]>("GET", `/posts/user/${username}`),
  createPost: (data: any) => apiRequest<any>("POST", "/posts", data),
  likePost: (postId: string) => apiRequest<any>("POST", `/posts/${postId}/like`),
  deletePost: (postId: string) => apiRequest<any>("DELETE", `/posts/${postId}`),
}

// Comment API
export const commentApi = {
  getComments: (postId: string) => apiRequest<any[]>("GET", `/comments/${postId}`),
  createComment: (postId: string, data: any) => apiRequest<any>("POST", `/comments/${postId}`, data),
  deleteComment: (commentId: string) => apiRequest<any>("DELETE", `/comments/${commentId}`),
}

// Notification API
export const notificationApi = {
  getNotifications: () => apiRequest<any[]>("GET", "/notifications"),
  markAsRead: (notificationId: string) => apiRequest<any>("PUT", `/notifications/${notificationId}/read`),
}

// Stream Chat API
export const streamApi = {
  getToken: () => apiRequest<{ token: string }>("GET", "/stream/token"),
  createChannel: (data: { otherUserId: string; otherUserName: string }) =>
    apiRequest<{ channelId: string }>("POST", "/stream/channel", data),
  getChannels: () => apiRequest<any[]>("GET", "/stream/channels"),
  sendMessage: (channelId: string, data: any) => apiRequest<any>("POST", `/stream/channel/${channelId}/message`, data),
}

// Export default API object
export default {
  userApi,
  postApi,
  commentApi,
  notificationApi,
  streamApi,
}
