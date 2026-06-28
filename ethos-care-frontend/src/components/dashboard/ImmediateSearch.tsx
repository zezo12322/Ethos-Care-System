"use client";

import React, { useState } from "react";
import Link from "next/link";
import { searchService } from "@/services/search.service";
import { CaseRecord, FamilyRecord } from "@/types/api";

interface ImmediateSearchResult {
  found: boolean;
  family: FamilyRecord | null;
  cases: CaseRecord[];
}

export default function ImmediateSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImmediateSearchResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query || query.length < 5) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchService.search(query);
      const foundClasses = data.families?.length > 0 || data.cases?.length > 0;
      setResult({
        found: foundClasses,
        family: data.families?.[0] || null,
        cases: data.cases || [],
      });
    } catch (err) {
      console.error(err);
      setResult({ found: false, family: null, cases: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section className="space-y-6">
      {/* لوحة بحث هادئة مناسبة لأداة عمل — لا hero ولا توهّج ولا gradient */}
      <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm sm:p-7">
        <div className="mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">
            person_search
          </span>
          <h2 className="text-lg font-bold text-on-surface">بحث سريع عن مستفيد</h2>
        </div>
        <p className="mb-5 text-sm text-on-surface-variant">
          اكتب الرقم القومي (14 رقمًا) للوصول الفوري لملف الأسرة وحالاتها.
        </p>

        <label htmlFor="nid-search" className="sr-only">
          الرقم القومي للمستفيد
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span
              className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-outline"
              aria-hidden="true"
            >
              id_card
            </span>
            <input
              id="nid-search"
              inputMode="numeric"
              maxLength={14}
              placeholder="مثال: 28xxxxxxxxxxxx"
              value={query}
              onChange={(e) => setQuery(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKeyDown}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3.5 pr-12 pl-4 text-base font-bold tracking-wider outline-none transition-colors focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || query.length < 5}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            >
              {loading ? "progress_activity" : "search"}
            </span>
            بحث
          </button>
        </div>
      </div>

      {searched && (
        <div aria-live="polite">
          {loading ? (
            <div className="h-32 animate-pulse rounded-3xl border border-outline-variant/20 bg-surface-container-low" />
          ) : result?.found ? (
            <div className="overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm animate-scale-in">
              <div className="p-6 sm:p-7">
                {result.family ? (
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant/20 pb-6">
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-bold text-on-surface-variant">
                        بيانات الأسرة
                      </p>
                      <h3 className="truncate text-xl font-extrabold text-on-surface">
                        {result.family.headName}
                      </h3>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {result.family.address}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-primary-container px-3 py-1 text-xs font-bold text-primary">
                        {result.family.status}
                      </span>
                      <span className="rounded-lg bg-surface-container-high px-3 py-1 text-xs font-bold text-on-surface">
                        عدد الأفراد: {result.family.membersCount}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mb-4 text-sm font-medium text-on-surface-variant">
                    لا يوجد ملف أسرة رئيسي مرتبط بهذا الرقم.
                  </p>
                )}

                {result.cases?.length > 0 ? (
                  <div>
                    <p className="mb-3 text-xs font-bold text-on-surface-variant">
                      الحالات / الطلبات ({result.cases.length})
                    </p>
                    <ul className="space-y-2.5">
                      {result.cases.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/dashboard/cases/${c.id}`}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 transition-colors hover:bg-surface-container"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-bold text-on-surface">
                                {c.applicantName}
                              </p>
                              <p className="mt-0.5 text-xs text-on-surface-variant">
                                {c.caseType}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-surface-container-highest px-3 py-1 text-xs font-bold text-on-surface-variant">
                              {c.lifecycleStatus}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant">
                    لا توجد حالات فردية مسجلة.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-10 text-center animate-fade-in">
              <span
                className="material-symbols-outlined mb-3 text-5xl text-outline"
                aria-hidden="true"
              >
                search_off
              </span>
              <h3 className="mb-1 text-lg font-bold text-on-surface">
                لم يتم العثور على نتائج
              </h3>
              <p className="text-sm text-on-surface-variant">
                تأكد من إدخال الرقم القومي المكوّن من 14 رقمًا بشكل صحيح.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
