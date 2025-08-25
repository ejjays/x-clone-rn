// utils/offline/SyncManager.ts
import { offlineQueue } from "@/utils/offline/OfflineQueue";
import type { OfflineAction, SyncProgress } from "@/utils/offline/types";
import EventEmitter from "eventemitter3";
import type { AxiosInstance } from "axios";
import type { StreamChat } from "stream-chat";
import { postApi, commentApi, userApi } from "@/utils/api";
import { queryClient } from "@/utils/offline/network";

export type ConflictResolver = (server: any, client: any, action: OfflineAction) => any;

export class SyncManager {
  private static instance: SyncManager | null = null;
  private emitter = new EventEmitter();
  private isRunning = false;
  private lastError?: string;
  private progress: SyncProgress = { inProgress: false, queuedCount: 0, successCount: 0, failedCount: 0 };
  private conflictResolver: ConflictResolver;

  private constructor(conflictResolver?: ConflictResolver) {
    this.conflictResolver = conflictResolver || ((server) => server);
  }

  static getInstance(conflictResolver?: ConflictResolver) {
    if (!SyncManager.instance) SyncManager.instance = new SyncManager(conflictResolver);
    return SyncManager.instance;
  }

  on(event: "progress", listener: (progress: SyncProgress) => void) {
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }

  getProgress(): SyncProgress {
    return { ...this.progress };
  }

  async run(api: AxiosInstance, chatClient?: StreamChat): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.progress = { inProgress: true, queuedCount: (await offlineQueue.list()).length, successCount: 0, failedCount: 0 };
    this.emitter.emit("progress", this.getProgress());

    try {
      await offlineQueue.drain(async (action) => this.handleAction(action, api, chatClient));
    } catch (e: any) {
      this.lastError = e?.message || String(e);
    } finally {
      this.isRunning = false;
      this.progress.inProgress = false;
      this.emitter.emit("progress", this.getProgress());
      // Invalidate critical queries after a sync pass
      queryClient.invalidateQueries({ queryKey: ["posts"] }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["notifications"] }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["authUser"] }).catch(() => {});
    }
  }

  private async handleAction(action: OfflineAction, api: AxiosInstance, chatClient?: StreamChat): Promise<void> {
    switch (action.type) {
      case "post_reaction": {
        const { postId, reactionType } = action.payload;
        await postApi.reactToPost(api, postId, reactionType);
        this.progress.successCount += 1;
        this.emitter.emit("progress", this.getProgress());
        return;
      }
      case "comment_create": {
        const { postId, content } = action.payload;
        await commentApi.createComment(api, postId, content);
        this.progress.successCount += 1;
        this.emitter.emit("progress", this.getProgress());
        return;
      }
      case "comment_like": {
        const { commentId } = action.payload;
        await commentApi.likeComment(api, commentId);
        this.progress.successCount += 1;
        this.emitter.emit("progress", this.getProgress());
        return;
      }
      case "notification_delete": {
        const { notificationId } = action.payload;
        await api.delete(`/notifications/${notificationId}`);
        this.progress.successCount += 1;
        this.emitter.emit("progress", this.getProgress());
        return;
      }
      case "user_profile_update": {
        const { data } = action.payload;
        await userApi.updateProfile(api, data);
        this.progress.successCount += 1;
        this.emitter.emit("progress", this.getProgress());
        return;
      }
      case "post_delete": {
        const { postId } = action.payload;
        await api.delete(`/posts/${postId}`);
        this.progress.successCount += 1;
        this.emitter.emit("progress", this.getProgress());
        return;
      }
      case "chat_message_send": {
        const { channelId, text, attachments } = action.payload;
        if (!chatClient) throw new Error("Chat client not available");
        const channel = chatClient.channel("messaging", channelId);
        await channel.sendMessage({ text, attachments });
        this.progress.successCount += 1;
        this.emitter.emit("progress", this.getProgress());
        return;
      }
      default: {
        // Unknown action; skip
        this.progress.failedCount += 1;
        this.emitter.emit("progress", this.getProgress());
      }
    }
  }
}

export const syncManager = SyncManager.getInstance();

