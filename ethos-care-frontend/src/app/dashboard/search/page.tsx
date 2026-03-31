"use client";

import Link from "next/link";
import { searchService } from "@/services/search.service";
import { SearchResults } from "@/types/api";
import { useEffect, useState } from "react";

const emptyResults: SearchResults = {
  cases: [],
  families: [],
};

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(emptyResults);
      setLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchService.search(searchTerm.trim());
        setResults(response);
      } catch (searchError) {
        console.error(searchError);
        setResults(emptyResults);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleSearchClick = async () => {
    if (!searchTerm.trim()) {
      setResults(emptyResults);
      return;
    }

    setLoading(true);
    try {
      const response = await searchService.search(searchTerm.trim());
      setResults(response);
    } catch (searchError) {
      console.error(searchError);
      setResults(emptyResults);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">البحث المتقدم</h1>
          <p className="text-on-surface-variant mt-1 text-sm">البحث الشامل في الحالات والأسر مع انتقال مباشر إلى تفاصيل السجل.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary text-3xl">search</span>
            <input
              type="text"
              placeholder="ابحث بالرقم القومي، اسم المستفيد، أو رقم الحالة..."
              className="w-full bg-surface-container-lowest border-2 border-outline-variant/50 focus:border-primary rounded-2xl py-5 pr-16 pl-4 text-lg font-bold outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button onClick={handleSearchClick} className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-container transition-colors">
              بحث
            </button>
          </div>
        </div>
      </div>

      {searchTerm && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="font-bold text-lg border-b border-outline-variant/30 pb-2">نتائج البحث ({searchTerm})</h3>

          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
            {loading && <div className="p-6 text-center text-outline font-bold animate-pulse">جاري البحث...</div>}

            {!loading && results.cases.length === 0 && results.families.length === 0 && (
              <div className="p-6 text-center text-outline">لا توجد نتائج مطابقة لبحثك</div>
            )}

            {!loading &&
              results.cases.map((caseRecord) => (
                <Link
                  key={`case-${caseRecord.id}`}
                  href={`/dashboard/cases/${caseRecord.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-surface-container-lowest transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">folder_shared</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">
                      {caseRecord.applicantName}
                      <span className="text-sm font-normal text-on-surface-variant mr-2">(حالة)</span>
                    </h4>
                    <p className="text-sm text-on-surface-variant flex flex-wrap gap-4">
                      <span className="font-mono">ID: {caseRecord.id.substring(0, 8)}</span>
                      <span>{caseRecord.caseType}</span>
                      <span>{caseRecord.nationalId || "بدون رقم قومي"}</span>
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline rtl:rotate-180">chevron_right</span>
                </Link>
              ))}

            {!loading &&
              results.families.map((family) => (
                <Link
                  key={`family-${family.id}`}
                  href={`/dashboard/families/${family.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-surface-container-lowest transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#fcb900]/20 text-[#bf8c00] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">family_restroom</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">
                      {family.headName}
                      <span className="text-sm font-normal text-on-surface-variant mr-2">(أسرة)</span>
                    </h4>
                    <p className="text-sm text-on-surface-variant flex flex-wrap gap-4">
                      <span className="font-mono">ID: {family.id.substring(0, 8)}</span>
                      <span>{family.address || family.city || "بدون عنوان"}</span>
                      <span>{family.nationalId || "بدون رقم قومي"}</span>
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline rtl:rotate-180">chevron_right</span>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
