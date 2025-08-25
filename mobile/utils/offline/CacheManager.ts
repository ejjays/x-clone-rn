// utils/offline/CacheManager.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNBlobUtil from "react-native-blob-util";
import { StorageKeys } from "@/utils/offline/storageKeys";
import type { CacheEntry, LruIndexEntry, CacheUsage, MediaCacheEntry } from "@/utils/offline/types";

const DEFAULT_MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export class CacheManager {
  private static instance: CacheManager | null = null;
  private maxSizeBytes: number;
  private lruIndexKey: string = StorageKeys.LRU_INDEX;
  private mediaIndexKey: string = StorageKeys.MEDIA_INDEX;

  private constructor(maxSizeBytes?: number) {
    this.maxSizeBytes = maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
  }

  static getInstance(maxSizeBytes?: number): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(maxSizeBytes);
    }
    return CacheManager.instance;
  }

  // ---- Generic KV cache with LRU eviction ----
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      await this.touchKey(key, entry.sizeBytes);
      return entry.value;
    } catch (e) {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    const sizeBytes = this.estimateSizeBytes(serialized);
    const now = Date.now();
    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      updatedAt: now,
      sizeBytes,
      ttlMs,
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
    await this.touchKey(key, sizeBytes);
    await this.evictIfNeeded();
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      const index = await this.getLruIndex();
      const next = index.filter((x) => x.key !== key);
      await AsyncStorage.setItem(this.lruIndexKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  async clearPrefix(prefix: string): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const matching = keys.filter((k) => k.startsWith(prefix));
    await AsyncStorage.multiRemove(matching);
    const index = await this.getLruIndex();
    const next = index.filter((x) => !x.key.startsWith(prefix));
    await AsyncStorage.setItem(this.lruIndexKey, JSON.stringify(next));
  }

  async getUsage(): Promise<CacheUsage> {
    const index = await this.getLruIndex();
    const totalBytes = index.reduce((sum, x) => sum + (x.sizeBytes || 0), 0);
    const mediaIndex = await this.getMediaIndex();
    const mediaBytes = mediaIndex.reduce((sum, x) => sum + (x.sizeBytes || 0), 0);
    return {
      totalBytes,
      itemCount: index.length,
      mediaBytes,
      dataBytes: Math.max(0, totalBytes - mediaBytes),
    };
  }

  // ---- Media cache helpers ----
  async cacheMedia(remoteUrl: string, opts?: { idHint?: string }): Promise<MediaCacheEntry> {
    const id = this.hash(remoteUrl + (opts?.idHint || ""));
    const mediaIndex = await this.getMediaIndex();
    const existing = mediaIndex.find((m) => m.id === id);
    if (existing) {
      await this.touchMedia(id);
      return existing;
    }

    const dir = RNBlobUtil.fs.dirs.CacheDir + "/media-cache";
    await RNBlobUtil.fs.mkdir(dir).catch(() => {});
    const ext = this.inferExtFromUrl(remoteUrl);
    const localPath = `${dir}/${id}${ext}`;

    // Download to local file
    await RNBlobUtil.config({ path: localPath, fileCache: true }).fetch("GET", remoteUrl);
    const stat = await RNBlobUtil.fs.stat(localPath);
    const sizeBytes = Number(stat.size || 0);
    const item: MediaCacheEntry = {
      id,
      remoteUrl,
      localPath,
      sizeBytes,
      mimeType: this.inferMimeFromExt(ext),
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };

    await this.setMediaIndex([...mediaIndex, item]);
    await this.evictIfNeeded();
    return item;
  }

  async getMedia(remoteUrl: string): Promise<MediaCacheEntry | null> {
    const id = this.hash(remoteUrl);
    const mediaIndex = await this.getMediaIndex();
    const existing = mediaIndex.find((m) => m.id === id);
    if (!existing) return null;
    await this.touchMedia(id);
    return existing;
  }

  async removeMediaById(id: string): Promise<void> {
    const mediaIndex = await this.getMediaIndex();
    const item = mediaIndex.find((m) => m.id === id);
    if (item) {
      await RNBlobUtil.fs.unlink(item.localPath).catch(() => {});
    }
    const rest = mediaIndex.filter((m) => m.id !== id);
    await this.setMediaIndex(rest);
  }

  // ---- Internal helpers ----
  private async touchKey(key: string, sizeBytes: number): Promise<void> {
    const index = await this.getLruIndex();
    const now = Date.now();
    const filtered = index.filter((x) => x.key !== key);
    const updated: LruIndexEntry = { key, sizeBytes, lastAccessedAt: now };
    const next = [updated, ...filtered].slice(0, 5000); // cap
    await AsyncStorage.setItem(this.lruIndexKey, JSON.stringify(next));
  }

  private async getLruIndex(): Promise<LruIndexEntry[]> {
    const raw = await AsyncStorage.getItem(this.lruIndexKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as LruIndexEntry[];
    } catch {
      return [];
    }
  }

  private async evictIfNeeded(): Promise<void> {
    const index = await this.getLruIndex();
    let total = index.reduce((sum, x) => sum + (x.sizeBytes || 0), 0);
    if (total <= this.maxSizeBytes) return;

    // Evict least recently used keys first (from end of list)
    const sorted = [...index].sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
    const lruAsc = sorted.reverse();
    for (const entry of lruAsc) {
      await AsyncStorage.removeItem(entry.key);
      total -= entry.sizeBytes || 0;
      if (total <= this.maxSizeBytes) break;
    }
    // Update index with only remaining keys
    const remaining = index.filter((x) => total >= 0 && (async () => (await AsyncStorage.getItem(x.key)) !== null)());
    await AsyncStorage.setItem(this.lruIndexKey, JSON.stringify(remaining));

    // Evict media files if still needed
    if (total > this.maxSizeBytes) {
      const mediaIndex = await this.getMediaIndex();
      const mediaSorted = [...mediaIndex].sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
      for (const media of mediaSorted) {
        await RNBlobUtil.fs.unlink(media.localPath).catch(() => {});
        total -= media.sizeBytes || 0;
        if (total <= this.maxSizeBytes) break;
      }
      const remainingMedia = await this.filterExistingMedia(mediaIndex);
      await this.setMediaIndex(remainingMedia);
    }
  }

  private async getMediaIndex(): Promise<MediaCacheEntry[]> {
    const raw = await AsyncStorage.getItem(this.mediaIndexKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as MediaCacheEntry[];
    } catch {
      return [];
    }
  }

  private async setMediaIndex(index: MediaCacheEntry[]): Promise<void> {
    await AsyncStorage.setItem(this.mediaIndexKey, JSON.stringify(index));
  }

  private async touchMedia(id: string): Promise<void> {
    const media = await this.getMediaIndex();
    const next = media.map((m) => (m.id === id ? { ...m, lastAccessedAt: Date.now() } : m));
    await this.setMediaIndex(next);
  }

  private async filterExistingMedia(items: MediaCacheEntry[]): Promise<MediaCacheEntry[]> {
    const existing: MediaCacheEntry[] = [];
    for (const m of items) {
      const exists = await RNBlobUtil.fs.exists(m.localPath);
      if (exists) existing.push(m);
    }
    return existing;
  }

  private estimateSizeBytes(serialized: string): number {
    // Approximate byte length of UTF-16 string
    return 2 * serialized.length;
  }

  private inferExtFromUrl(url: string): string {
    const match = url.match(/\.(png|jpg|jpeg|webp|gif|mp4|mov|m4v|mkv)(\?|$)/i);
    if (!match) return "";
    return `.${match[1].toLowerCase()}`;
    }

  private inferMimeFromExt(ext: string): string | undefined {
    const map: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".m4v": "video/x-m4v",
      ".mkv": "video/x-matroska",
    };
    return map[ext];
  }

  private hash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const chr = input.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

export const cacheManager = CacheManager.getInstance();

