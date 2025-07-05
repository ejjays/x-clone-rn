import axios, { type AxiosInstance } from "axios";
import { useAuth } from "@clerk/clerk-expo";

// --- Configuration ---

// Use the environment variable for the API URL provided by EAS Secrets.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// If the API URL is not set, throw an error to fail fast during development.
// This prevents the app from trying to connect to a non-existent URL.
if (!API_BASE_URL) {
  throw new Error(
    "🔴 FATAL: EXPO_PUBLIC_API_URL is not defined. Please set it in your EAS Secrets.",
  );
}

console.log(`✅ Initializing API with base URL: ${API_BASE_URL}`);

// --- API Client Creation ---

/**
 * Creates a configured Axios instance for making API requests.
 * It automatically adds the JWT token to the headers for authenticated requests.
 *
 * @param getToken - An async function from Clerk's useAuth() to retrieve the session token.
 * @returns A configured AxiosInstance.
 */
export const createApiClient = (getToken: () => Promise<string | null>): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10-second timeout
  });

  // --- Interceptors for Logging and Authentication ---

  // Request interceptor to add the auth token to every request
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Optional: Log requests for easier debugging
      // console.log("➡️ API Request:", {
      //   method: config.method?.toUpperCase(),
      //   url: config.url,
      //   hasToken: !!token,
      // });
    } catch (error) {
      console.error("❌ Error retrieving auth token:", error);
    }
    return config;
  });

  // Response interceptor for logging responses and errors
  api.interceptors.response.use(
    (response) => {
      // Optional: Log successful responses
      // console.log("⬅️ API Response:", {
      //   status: response.status,
      //   url: response.config.url,
      // });
      return response;
    },
    (error) => {
      // Log detailed error information
      console.error("❌ API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.error || error.message,
      });
      return Promise.reject(error);
    },
  );

  return api;
};

// --- Hooks and API Definitions ---

/**
 * Custom hook to get an API client instance ready to use in your components.
 */
export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();
  // We memoize the client instance so it's not recreated on every render
  return createApiClient(getToken);
};

// --- API Endpoints ---

// Group related API calls for better organization

export const userApi = {
  syncUser: (api: AxiosInstance) => api.post("/users/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  updateProfile: (api: AxiosInstance, data: any) => api.put("/users/profile", data),
  getAllUsers: (api: AxiosInstance) => api.get("/users/all"),
  followUser: (api: AxiosInstance, userId: string) => api.post(`/users/follow/${userId}`),
};

export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) => api.post("/posts", data),
  getPosts: (api: AxiosInstance) => api.get("/posts"),
  getUserPosts: (api: AxiosInstance, username: string) => api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) => api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
};

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
};

export const streamApi = {
  getToken: (api: AxiosInstance) => api.get("/stream/token"),
  createChannel: (api: AxiosInstance, data: { members: string[]; name?: string }) => api.post("/stream/channel", data),
  getChannels: (api: AxiosInstance) => api.get("/stream/channels"),
};