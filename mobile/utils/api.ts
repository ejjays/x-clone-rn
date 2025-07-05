import axios, { type AxiosInstance } from "axios";
import { useAuth } from "@clerk/clerk-expo";
import React from "react"; // Import React to use useMemo

// --- Configuration ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "🔴 FATAL: EXPO_PUBLIC_API_URL is not defined. Please set it in your EAS Secrets.",
  );
}

// --- API Client Creation ---
// This function remains the same
export const createApiClient = (getToken: () => Promise<string | null>): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("❌ Error retrieving auth token:", error);
    }
    return config;
  });

  return api;
};


// --- THIS IS THE FIX ---
/**
 * Custom hook to get a memoized API client instance.
 * `useMemo` ensures the API client is not recreated on every render,
 * preventing infinite loops in dependent hooks.
 */
export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();

  // We wrap createApiClient in useMemo.
  // The API client will only be recreated if the getToken function instance changes.
  return React.useMemo(() => createApiClient(getToken), [getToken]);
};


// --- API Endpoints ---
// These remain the same
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