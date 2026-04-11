"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SyncStatus =
  | "idle"            // no draft stored
  | "saved_locally"   // draft saved to localStorage
  | "syncing"         // currently uploading
  | "synced"          // successfully synced to server
  | "offline"         // browser is offline, saved locally
  | "error";          // sync failed, will retry

export interface PendingSubmission<T> {
  id: string;
  payload: T;
  queuedAt: number;
}

export interface UseOfflineDraftOptions<T> {
  /** Unique storage key — e.g. "case-draft-new" or "case-draft-{id}" */
  storageKey: string;
  /** Debounce delay in ms for auto-save (default 800) */
  debounceMs?: number;
  /** Called when a queued submission should be sent to the server */
  onSync?: (payload: T) => Promise<void>;
}

export interface UseOfflineDraftReturn<T> {
  /** Load a previously stored draft (call once on mount) */
  loadDraft: () => T | null;
  /** Save draft to localStorage (debounced) */
  saveDraft: (data: T) => void;
  /** Save draft immediately without debounce */
  saveDraftNow: (data: T) => void;
  /** Clear stored draft from localStorage */
  clearDraft: () => void;
  /** Queue a submission for offline sync */
  queueSubmission: (payload: T) => void;
  /** Current sync status */
  syncStatus: SyncStatus;
  /** Whether browser is currently online */
  isOnline: boolean;
  /** Timestamp of last local save */
  lastSavedAt: number | null;
  /** Number of pending offline submissions */
  pendingCount: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const QUEUE_KEY = "ethos-offline-queue";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — silently ignore
  }
}

function readQueue<T>(): PendingSubmission<T>[] {
  return readJSON<PendingSubmission<T>[]>(QUEUE_KEY) ?? [];
}

function writeQueue<T>(queue: PendingSubmission<T>[]) {
  writeJSON(QUEUE_KEY, queue);
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useOfflineDraft<T>(
  options: UseOfflineDraftOptions<T>,
): UseOfflineDraftReturn<T> {
  const { storageKey, debounceMs = 800, onSync } = options;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncingRef = useRef(false);

  // Track online/offline
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Update pending count on mount
  useEffect(() => {
    setPendingCount(readQueue().length);
  }, []);

  // Try to flush queue when we come back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      void flushQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // ---- Draft persistence ----

  const loadDraft = useCallback((): T | null => {
    const data = readJSON<{ data: T; savedAt: number }>(storageKey);
    if (data) {
      setLastSavedAt(data.savedAt);
      setSyncStatus("saved_locally");
      return data.data;
    }
    return null;
  }, [storageKey]);

  const saveDraftNow = useCallback(
    (data: T) => {
      const now = Date.now();
      writeJSON(storageKey, { data, savedAt: now });
      setLastSavedAt(now);
      setSyncStatus(isOnline ? "saved_locally" : "offline");
    },
    [storageKey, isOnline],
  );

  const saveDraft = useCallback(
    (data: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => saveDraftNow(data), debounceMs);
    },
    [saveDraftNow, debounceMs],
  );

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setLastSavedAt(null);
    setSyncStatus("idle");
  }, [storageKey]);

  // ---- Offline queue ----

  const queueSubmission = useCallback(
    (payload: T) => {
      if (isOnline && onSync) {
        // Try to send immediately
        setSyncStatus("syncing");
        onSync(payload)
          .then(() => {
            setSyncStatus("synced");
            clearDraft();
          })
          .catch(() => {
            // Failed — add to queue
            const queue = readQueue<T>();
            queue.push({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              payload,
              queuedAt: Date.now(),
            });
            writeQueue(queue);
            setPendingCount(queue.length);
            setSyncStatus("error");
          });
      } else {
        // Offline — add to queue
        const queue = readQueue<T>();
        queue.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          payload,
          queuedAt: Date.now(),
        });
        writeQueue(queue);
        setPendingCount(queue.length);
        setSyncStatus("offline");
      }
    },
    [isOnline, onSync, clearDraft],
  );

  const flushQueue = useCallback(async () => {
    if (!onSync || syncingRef.current) return;
    syncingRef.current = true;

    const queue = readQueue<T>();
    const remaining: PendingSubmission<T>[] = [];

    for (const entry of queue) {
      try {
        setSyncStatus("syncing");
        await onSync(entry.payload);
      } catch {
        remaining.push(entry);
      }
    }

    writeQueue(remaining);
    setPendingCount(remaining.length);
    setSyncStatus(remaining.length > 0 ? "error" : "synced");
    syncingRef.current = false;
  }, [onSync]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    loadDraft,
    saveDraft,
    saveDraftNow,
    clearDraft,
    queueSubmission,
    syncStatus,
    isOnline,
    lastSavedAt,
    pendingCount,
  };
}
