"use client";

import React from "react";
import type { SortDirection } from "@/hooks/useTableSort";

interface SortableThProps {
  /** مفتاح العمود — لازم يطابق مفتاح المقارنة في useTableSort. */
  sortKey: string;
  /** المفتاح النشط حالياً في الجدول. */
  activeKey: string | null;
  /** اتجاه الفرز الحالي. */
  direction: SortDirection;
  /** يُستدعى عند طلب فرز هذا العمود. */
  onSort: (key: string) => void;
  children: React.ReactNode;
  /** أصناف إضافية للخلية (مثل إخفاء متجاوب أو محاذاة). */
  className?: string;
  /** محاذاة المحتوى داخل الزر. */
  align?: "start" | "center";
}

/**
 * رأس عمود قابل للفرز ومتاح:
 * - `aria-sort` على `<th>` (ascending / descending / none).
 * - زر داخلي ليتلقّى التركيز والنقر والكيبورد (Enter/Space تلقائياً).
 * - أيقونة تتغيّر حسب حالة الفرز (لا تعتمد على اللون وحده).
 */
export default function SortableTh({
  sortKey,
  activeKey,
  direction,
  onSort,
  children,
  className = "",
  align = "start",
}: SortableThProps) {
  const isActive = activeKey === sortKey;
  const ariaSort = isActive
    ? direction === "asc"
      ? "ascending"
      : "descending"
    : "none";

  const icon = isActive
    ? direction === "asc"
      ? "arrow_upward"
      : "arrow_downward"
    : "unfold_more";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-6 py-4 font-bold ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`group inline-flex w-full items-center gap-1.5 rounded-lg text-inherit transition-colors hover:text-on-surface ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <span>{children}</span>
        <span
          className={`material-symbols-outlined text-[16px] transition-opacity ${
            isActive
              ? "text-primary opacity-100"
              : "text-outline opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </button>
    </th>
  );
}
