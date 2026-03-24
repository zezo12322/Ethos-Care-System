"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function DynamicNews() {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    api.get("/news").then(res => {
      setNews(res.data.slice(0, 3)); // Get top 3 news
    }).catch(err => console.error(err));
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="border-r-4 border-primary pr-6">
            <h2 className="text-3xl font-extrabold font-headline text-primary mb-4">أخبار الفرع</h2>
            <p className="text-on-surface-variant text-lg">تابع أحدث فعاليات وأنشطة أجيال أجيال صناع الحياة في محافظة بني سويف</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.length === 0 ? <p className="text-outline">لا توجد أخبار حالياً</p> : news.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-outline-variant/20 group hover:shadow-lg transition-all flex flex-col">
              <div className="h-48 relative overflow-hidden bg-surface-container-low flex items-center justify-center shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-outline">newspaper</span>
                )}
                <div className="absolute top-4 right-4 bg-[#fcb900] text-xs font-bold px-3 py-1 rounded-full">{item.category || "أخبار"}</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs text-on-surface-variant font-bold mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {new Date(item.date || new Date()).toLocaleDateString("ar-EG")}
                </p>
                <h3 className="text-xl font-bold font-headline mb-3 text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-3">
                  {item.content}
                </p>
                
                <div className="mt-auto">
                    <Link href={`/news/${item.id}`} className="text-primary font-bold text-sm hover:underline flex items-center gap-1 w-fit">
                        اقرأ المزيد <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
