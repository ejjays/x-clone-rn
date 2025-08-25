// utils/offline/types.ts

export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  updatedAt: number;
  sizeBytes: number;
  ttlMs?: number;
  tags?: string[];
}

export interface LruIndexEntry {
  key: string;
  sizeBytes: number;
  lastAccessedAt: number;
}

export interface CacheUsage {
  totalBytes: number;
  itemCount: number;
  mediaBytes: number;
  dataBytes: number;
}

export type OfflineActionType =
  | "post_reaction"
  | "comment_create"
  | "comment_like"
  | "notification_delete"
  | "chat_message_send"
  | "user_profile_update"
  | "post_delete";

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: Record<string, any>;
  createdAt: number;
  attempt: number;
  maxAttempts: number;
  nextAttemptAt: number;
  status: "queued" | "running" | "failed" | "done";
  dependsOnId?: string;
}

export interface SyncProgress {
  inProgress: boolean;
  queuedCount: number;
  successCount: number;
  failedCount: number;
  lastError?: string;
}

export interface MediaCacheEntry {
  id: string; // hash of url + transform
  remoteUrl: string;
  localPath: string; // file path on device
  sizeBytes: number;
  mimeType?: string;
  width?: number;
  height?: number;
  createdAt: number;
  lastAccessedAt: number;
}

