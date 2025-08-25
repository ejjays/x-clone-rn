// utils/offline/OfflineQueue.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "@/utils/offline/storageKeys";
import type { OfflineAction } from "@/utils/offline/types";
import EventEmitter from "eventemitter3";

const MAX_ATTEMPTS_DEFAULT = 5;

export class OfflineQueue {
  private static instance: OfflineQueue | null = null;
  private emitter = new EventEmitter();

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) OfflineQueue.instance = new OfflineQueue();
    return OfflineQueue.instance;
  }

  on(event: "change", listener: () => void) {
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }

  async enqueue(action: Omit<OfflineAction, "id" | "createdAt" | "attempt" | "maxAttempts" | "nextAttemptAt" | "status"> & { id?: string }): Promise<OfflineAction> {
    const queue = await this.getQueue();
    const id = action.id || this.generateId();
    const now = Date.now();
    const item: OfflineAction = {
      id,
      type: action.type,
      payload: action.payload,
      createdAt: now,
      attempt: 0,
      maxAttempts: MAX_ATTEMPTS_DEFAULT,
      nextAttemptAt: now,
      status: "queued",
      dependsOnId: action.dependsOnId,
    };
    queue.push(item);
    await this.setQueue(queue);
    this.emitter.emit("change");
    return item;
  }

  async list(): Promise<OfflineAction[]> {
    return this.getQueue();
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(StorageKeys.OFFLINE_QUEUE);
    this.emitter.emit("change");
  }

  // Drain queue by invoking the provided handler per action with exponential backoff
  async drain(handler: (action: OfflineAction) => Promise<void>): Promise<{ success: number; failed: number }> {
    let queue = await this.getQueue();
    let success = 0;
    let failed = 0;
    for (let i = 0; i < queue.length; i++) {
      const action = queue[i];
      const now = Date.now();
      if (action.status === "done") continue;
      if (action.nextAttemptAt > now) continue;
      try {
        action.status = "running";
        await handler(action);
        action.status = "done";
        success += 1;
      } catch (e) {
        action.attempt += 1;
        action.status = "failed";
        failed += 1;
        const delay = Math.min(30_000, Math.pow(2, action.attempt) * 1000);
        action.nextAttemptAt = Date.now() + delay;
      }
      queue[i] = action;
      await this.setQueue(queue);
    }
    // Remove done actions
    queue = queue.filter((a) => a.status !== "done");
    await this.setQueue(queue);
    this.emitter.emit("change");
    return { success, failed };
  }

  private async getQueue(): Promise<OfflineAction[]> {
    const raw = await AsyncStorage.getItem(StorageKeys.OFFLINE_QUEUE);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as OfflineAction[];
      // Filter legacy or malformed
      return parsed.filter((x) => x && x.type && x.payload);
    } catch {
      return [];
    }
  }

  private async setQueue(queue: OfflineAction[]): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.OFFLINE_QUEUE, JSON.stringify(queue));
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export const offlineQueue = OfflineQueue.getInstance();

