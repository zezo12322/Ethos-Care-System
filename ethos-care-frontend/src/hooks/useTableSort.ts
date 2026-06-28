"use client";

import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export type SortComparator<T> = (left: T, right: T) => number;

export interface TableSortState {
  key: string | null;
  direction: SortDirection;
}

/**
 * Hook فرز عام للجداول.
 * - يستقبل قائمة العناصر وخريطة مقارنات لكل عمود قابل للفرز.
 * - يرجّع القائمة بعد الفرز + الحالة الحالية + دالة تبديل.
 *
 * الفرز ثابت (stable) لأن Array.prototype.sort مستقرّ في كل المتصفحات الحديثة،
 * ونعمل على نسخة عشان ما نعدّلش الـ prop الأصلي.
 */
export function useTableSort<T>(
  items: T[],
  comparators: Record<string, SortComparator<T>>,
  initial?: TableSortState,
) {
  const [sort, setSort] = useState<TableSortState>(
    initial ?? { key: null, direction: "asc" },
  );

  const toggleSort = (key: string) => {
    setSort((current) => {
      if (current.key !== key) {
        return { key, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }

      // النقرة الثالثة تلغي الفرز وترجّع الترتيب الأصلي
      return { key: null, direction: "asc" };
    });
  };

  const sorted = useMemo(() => {
    if (!sort.key || !comparators[sort.key]) {
      return items;
    }

    const comparator = comparators[sort.key];
    const factor = sort.direction === "asc" ? 1 : -1;

    return [...items].sort((left, right) => comparator(left, right) * factor);
    // comparators كائن ثابت التعريف داخل المكوّن، فنكتفي بالاعتماد على المفاتيح
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, sort.key, sort.direction]);

  return { sorted, sort, toggleSort };
}

/** مقارنة نصّية عربية آمنة (تتعامل مع null/undefined). */
export const compareText = (left?: string | null, right?: string | null) =>
  (left ?? "").localeCompare(right ?? "", "ar");

/** مقارنة رقمية آمنة. */
export const compareNumber = (left?: number | null, right?: number | null) =>
  (left ?? 0) - (right ?? 0);

/** مقارنة تواريخ آمنة (القيم غير الصالحة تُعتبر أقدم). */
export const compareDate = (left?: string | null, right?: string | null) => {
  const leftTime = left ? new Date(left).getTime() : Number.NaN;
  const rightTime = right ? new Date(right).getTime() : Number.NaN;
  const safeLeft = Number.isNaN(leftTime) ? -Infinity : leftTime;
  const safeRight = Number.isNaN(rightTime) ? -Infinity : rightTime;
  return safeLeft - safeRight;
};

/** مقارنة حسب ترتيب رتب معرّف مسبقاً (مثل الأولوية: عاجل > عالي > عادي). */
export const compareByRank = (
  ranks: Record<string, number>,
  left?: string | null,
  right?: string | null,
) => (ranks[left ?? ""] ?? -1) - (ranks[right ?? ""] ?? -1);
