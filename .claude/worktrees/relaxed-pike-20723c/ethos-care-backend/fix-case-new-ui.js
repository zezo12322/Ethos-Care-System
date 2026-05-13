const fs = require('fs');
let content = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/new/page.tsx', 'utf8');

const updated = `
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { casesService } from "@/services/cases.service";
import api from "@/lib/api";

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [familyFound, setFamilyFound] = useState(false);
  const [formData, setFormData] = useState({
    applicantName: "",
    nationalId: "",
    caseType: "",
    priority: "عادي",
    description: "",
    familyId: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset family finding state if they change the national ID
    if (name === 'nationalId') {
      setFamilyFound(false);
    }
  };

  const searchFamily = async () => {
    if (!formData.nationalId || formData.nationalId.length < 14) {
      alert("الرجاء إدخال رقم قومي صحيح (14 رقم)");
      return;
    }
    
    setSearchLoading(true);
    try {
      const res = await api.get(\`/search?q=\${formData.nationalId}\`);
      if (res.data.found && res.data.family) {
        setFamilyFound(true);
        // Pre-fill fields
        setFormData(prev => ({
          ...prev,
          applicantName: res.data.family.name,
          familyId: res.data.family.id
        }));
        alert("تم العثور على الأسرة بنجاح");
      } else {
        alert("لم يتم العثور على أسرة بهذا الرقم القومي. يرجى تسجيل الأسرة أولاً.");
        setFamilyFound(false);
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء البحث");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!familyFound) {
      alert("يجب البحث عن الأسرة واختيارها أولاً لربط الحالة بها");
      return;
    }
    if (!formData.applicantName || !formData.caseType) {
      alert("الرجاء إدخال اسم المستفيد ونوع التدخل");
      return;
    }
    
    setLoading(true);
    try {
      await casesService.create(formData);
      router.push("/dashboard/cases");
    } catch (error) {
      console.error("Error creating case", error);
      alert("حدث خطأ أثناء حفظ الحالة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/cases" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">إضافة حالة جديدة</h1>
          <p className="text-on-surface-variant text-sm mt-1">تحديد احتياج جديد لأسرة مسجلة</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Step 1: Search Family */}
          <section>
            <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">search</span>
              البحث عن الأسرة
            </h2>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input 
                  name="nationalId" 
                  value={formData.nationalId} 
                  onChange={handleChange} 
                  type="text" 
                  maxLength={14} 
                  dir="ltr" 
                  placeholder="أدخل الرقم القومي للأسرة..."
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary pr-12" 
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">badge</span>
              </div>
              <button 
                onClick={searchFamily}
                disabled={searchLoading || formData.nationalId.length < 14}
                className="px-6 py-3 bg-surface-container-high text-on-surface hover:bg-surface-container-highest rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {searchLoading ? "جاري البحث..." : "بحث"}
              </button>
            </div>
          </section>

          {/* Step 2: Case Details Details */}
          <section className={\`transition-opacity duration-300 \${familyFound ? 'opacity-100' : 'opacity-50 pointer-events-none'}\`}>
            <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">description</span>
              بيانات التدخل المطلوبة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30">
              <div>
                <label className="block text-sm font-bold mb-2">اسم المستفيد (تلقائي من البحث)</label>
                <input name="applicantName" value={formData.applicantName} disabled type="text" className="w-full bg-surface-container border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none opacity-70" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">نوع التدخل (الخدمة المطلوبة)</label>
                <select name="caseType" value={formData.caseType} onChange={handleChange} className="w-full bg-white border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none focus:border-primary">
                  <option value="">اختر...</option>
                  <option value="تمكين اقتصادي">تمكين اقتصادي</option>
                  <option value="تدخل طبي">تدخل طبي</option>
                  <option value="تعليم">دعم تعليمي</option>
                  <option value="سكن كريم">سكن كريم</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">مستوى الأولوية</label>
                <div className="flex gap-3">
                  {["عادي", "عالي", "عاجل"].map(level => (
                    <label key={level} className={\`flex-1 text-center py-2.5 rounded-xl border cursor-pointer font-bold transition-all \${formData.priority === level ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low'}\`}>
                      <input type="radio" name="priority" value={level} checked={formData.priority === level} onChange={handleChange} className="hidden" />
                      {level}
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">تفاصيل الاحتياج</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary resize-none placeholder:text-outline" placeholder="اكتب وصفاً مفصلاً لمتطلبات الحالة والتدخل اللازم..."></textarea>
              </div>
            </div>
          </section>

        </div>
        
        <div className="bg-surface-container-lowest p-6 border-t border-outline-variant/30 flex justify-end gap-3">
          <Link href="/dashboard/cases" className="px-6 py-2.5 font-bold text-on-surface-variant hover:bg-outline-variant/10 rounded-xl transition-colors">
            إلغاء
          </Link>
          <button 
            disabled={loading || !familyFound}
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-primary text-white hover:bg-primary-container rounded-xl font-bold transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ وإنشاء الحالة"}
          </button>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/new/page.tsx', updated);
