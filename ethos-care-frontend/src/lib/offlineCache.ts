"use client";

/**
 * كاش بسيط لبيانات المرجع (المواقع، الأسر) في localStorage حتى تظل
 * متاحة للاستمارة عند العمل بدون اتصال (offline).
 */

const PREFIX = "ethos-cache-";

export const LOCATIONS_CACHE_KEY = "locations";
export const FAMILIES_CACHE_KEY = "families";

export function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeCache(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // تجاوز سعة التخزين — نتجاهل بصمت
  }
}
