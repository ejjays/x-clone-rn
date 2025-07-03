import { useAuth } from "@clerk/clerk-expo"

// 🔥 FIX THIS URL - Your current deployment doesn't exist!
// Check your actual Vercel deployment URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://x-clone-rn-one.vercel.app/api"

console.log("🌐 API Base URL:", API_BASE_URL)

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
      console.log("🔑 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token,
      })
    } catch (error) {
      console.error("❌ Error getting auth token:", error)
    }
    return config
  })

  api.interceptors.response.use(
    (response) => {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
      })
      return response
    },
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

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth()
  return createApiClient(getToken)
}

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
  getUserPosts: (api: AxiosInstance, username: string) => api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) => api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
}

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
}

// 🔥 NEW: Stream Chat API
export const streamApi = {
  getToken: (api: AxiosInstance) => api.get("/stream/token"),
  createChannel: (api: AxiosInstance, data: { members: string[]; name?: string }) => api.post("/stream/channel", data),
  getChannels: (api: AxiosInstance) => api.get("/stream/channels"),
}
