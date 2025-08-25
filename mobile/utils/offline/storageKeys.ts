// utils/offline/storageKeys.ts
// Centralized storage keys to avoid collisions and keep naming consistent

export const StorageKeys = {
  AUTH_STATE: "auth:state",
  LAST_USER_ID: "auth:lastUserId",
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,

  // React Query persistence
  RQ_CACHE: "rq:cache:v1",

  // Generic cache + LRU
  LRU_INDEX: "cache:lru:index",
  CACHE_USAGE: "cache:usage",

  // Posts and content
  POSTS_INDEX: "posts:index",
  POSTS_BY_USERNAME: (username: string) => `posts:user:${username}`,
  POSTS_ALL: "posts:all",
  POST_BY_ID: (postId: string) => `post:${postId}`,
  USER_INDEX: "users:index",

  // Media cache
  MEDIA_INDEX: "media:index",
  MEDIA_ITEM: (hash: string) => `media:item:${hash}`,

  // Notifications
  NOTIFICATIONS: "notifications:list",

  // Offline queue & sync
  OFFLINE_QUEUE: "offline:queue",
  SYNC_META: "sync:meta",

  // Chat caching
  CHAT_CHANNELS: "chat:channels",
  CHAT_MESSAGES: (channelId: string) => `chat:messages:${channelId}`,
} as const;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];

