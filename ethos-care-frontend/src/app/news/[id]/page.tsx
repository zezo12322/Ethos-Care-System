"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function NewsArticle() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/news/${id}`)
        .then(res => {
          setArticle(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col font-sans mb-12" dir="rtl">
        <PublicHeader />
        <div className="flex-1 flex justify-center items-center py-20">
          <p className="text-xl text-outline">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-surface flex flex-col font-sans mb-12" dir="rtl">
        <PublicHeader />
        <div className="flex-1 flex flex-col justify-center items-center py-20">
          <p className="text-2xl text-error mb-4">الخبر غير موجود</p>
          <Link href="/" className="text-primary hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans mb-12" dir="rtl">
      <PublicHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold mb-8 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors w-fit">
            <span className="material-symbols-outlined rtl:rotate-180">arrow_back</span>
            العودة
        </Link>
        
        <article className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/20">
            <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#fcb900]/20 text-[#cc9600] font-bold px-4 py-1.5 rounded-full text-sm">
                    {article.category || "أخبار"}
                </span>
                <span className="text-outline text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    {new Date(article.date || new Date()).toLocaleDateString("ar-EG", { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline mb-8 text-on-surface leading-tight">
                {article.title}
            </h1>

            {article.image && (
                <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-10 bg-surface-container">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                </div>
            )}
            
            <div className="prose prose-lg max-w-none text-on-surface-variant leading-loose whitespace-pre-wrap">
                {article.content}
            </div>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
