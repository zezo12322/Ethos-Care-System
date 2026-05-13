"use client";

import React, { useState } from 'react';
import { searchService } from '@/services/search.service';
import { CaseRecord, FamilyRecord } from '@/types/api';

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
        cases: data.cases || []
      });
    } catch (err) {
      console.error(err);
      setResult({ found: false, family: null, cases: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <>
      <section className="mb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-fixed/30 text-primary font-bold rounded-full text-xs mb-4">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          البحث السريع بالرقم القومي
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight leading-tight">
          البحث الفوري عن <span className="text-primary">بيانات الحالة</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto font-body">
          أدخل الرقم القومي للمستفيد للوصول السريع لملف الأسرة وتحديث بيانات الدعم.
        </p>

        <div className="relative max-w-3xl mx-auto mt-12 group">
          <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full transition-all group-focus-within:bg-primary/10"></div>
          <div className="relative flex items-center bg-surface-container-lowest rounded-2xl shadow-[0px_12px_32px_-4px_rgba(0,40,38,0.08)] border border-outline-variant/20 p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-outline mr-6 text-3xl">id_card</span>
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-2xl font-bold py-6 px-4 outline-none placeholder:text-outline/40 placeholder:font-normal text-right tracking-[0.2em]"
              maxLength={14}
              placeholder="أدخل الرقم القومي للبحث الفوري..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="ml-2 bg-primary text-on-primary px-10 py-5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined">search</span>
              )}
              بحث
            </button>
          </div>
        </div>
      </section>

      {searched && (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start mb-16 max-w-4xl mx-auto">
          {result?.found ? (
            <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0px_12px_32px_-4px_rgba(0,40,38,0.04)] border border-outline-variant/10">
              <div className="h-3 bg-gradient-to-l from-primary to-primary-container"></div>
              <div className="p-8">
                {result.family ? (
                  <div className="mb-6 border-b border-outline-variant/20 pb-6">
                    <h3 className="text-sm font-bold text-primary mb-2">بيانات الأسرة</h3>
                    <h2 className="text-2xl font-extrabold font-headline mb-1">{result.family.headName}</h2>
                    <p className="text-on-surface-variant text-sm mb-4">{result.family.address}</p>
                    <div className="flex gap-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-bold">{result.family.status}</span>
                      <span className="text-sm font-bold bg-surface-container-high px-3 py-1 rounded-lg">عدد الأفراد: {result.family.membersCount}</span>
                    </div>
                  </div>
                ) : (
                   <p className="text-on-surface-variant text-sm font-bold mb-4">لا يوجد ملف أسرة رئيسي مرتبط بهذا الرقم</p>
                )}

                {result.cases?.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-4">الحالات / الطلبات ({result.cases.length})</h3>
                    <div className="space-y-4">
                      {result.cases.map((c) => (
                        <div key={c.id} className="flex justify-between items-center bg-surface-container-high p-4 rounded-xl">
                          <div>
                            <p className="font-bold">{c.applicantName}</p>
                            <p className="text-xs text-on-surface-variant mt-1">{c.caseType}</p>
                          </div>
                          <div>
                            <span className="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold">{c.lifecycleStatus}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-outline">لا توجد حالات فردية مسجلة</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl p-10 text-center border border-outline-variant/10">
              <span className="material-symbols-outlined text-5xl text-outline mb-4">search_off</span>
              <h2 className="text-xl font-bold font-headline mb-2">لم يتم العثور على نتائج</h2>
              <p className="text-on-surface-variant text-sm">تأكد من إدخال الرقم القومي المكون من 14 رقماً بشكل صحيح.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
