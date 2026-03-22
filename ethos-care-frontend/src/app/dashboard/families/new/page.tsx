"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { familiesService } from "@/services/families.service";

export default function NewFamilyPage() {
  const router = useRouter();
  const [membersData, setMembersData] = useState([ { name: "", age: "", relation: "ابن/ة", education: "لا يدرس" } ]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    headName: "",
    nationalId: "",
    phone: "",
    socialStatus: "متزوج/ة",
    job: "",
    income: "",
    city: "بني سويف - المركز",
    village: "",
    addressDetails: "",
    caseType: "تمكين اقتصادي",
    priority: "عادي",
    description: ""
  });

  
  const handleMemberChange = (index: number, field: string, value: string) => {
    const newMembers = [...membersData];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembersData(newMembers);
  };

  const updateMembersCount = (newCount: number) => {
    if (newCount < 0) return;
    if (newCount > membersData.length) {
      const diff = newCount - membersData.length;
      const additional = Array(diff).fill(null).map(() => ({ name: "", age: "", relation: "ابن/ة", education: "لا يدرس" }));
      setMembersData([...membersData, ...additional]);
    } else {
      setMembersData(membersData.slice(0, newCount));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (membersData.length > 0) {
      const hasInvalid = membersData.some(m => !m.name.trim() || !m.age);
      if (hasInvalid) {
        alert("الرجاء إدخال اسم وسن جميع الأفراد التابعين بشكل صحيح");
        return;
      }
    }
    if (!formData.headName || !formData.phone) {
      alert("الرجاء إدخال اسم العائل ورقم التليفون الأساسي");
      return;
    }
    
    setLoading(true);
    try {
      await familiesService.create({
        ...formData,
        membersDetails: membersData,
        membersCount: membersData.length + 1, // +1 for the head
        address: `${formData.village} - ${formData.city}`,
      });
      router.push("/dashboard/families");
    } catch (error) {
      console.error("Error creating family", error);
      alert("حدث خطأ أثناء تسجيل الأسرة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/families" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined rtl:rotate-180">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">تسجيل أسرة جديدة</h1>
          <p className="text-sm text-on-surface-variant">إدخال بيانات أسرة وبناء ملفها الديموغرافي في النظام</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-[0px_8px_24px_-8px_rgba(0,40,38,0.04)] overflow-hidden">
        <div className="p-8 space-y-8">
          
          <section>
             <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">person</span>
              بيانات عائل الأسرة (الأب / الأم المعيلة)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">الاسم الرباعي</label>
                <input name="headName" value={formData.headName} onChange={handleChange} type="text" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">الرقم القومي</label>
                <input name="nationalId" value={formData.nationalId} onChange={handleChange} type="text" maxLength={14} dir="ltr" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">رقم التليفون الأساسي</label>
                <input name="phone" value={formData.phone} onChange={handleChange} type="tel" dir="ltr" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">الحالة الاجتماعية</label>
                <select name="socialStatus" value={formData.socialStatus} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none focus:border-primary">
                  <option value="متزوج/ة">متزوج/ة</option>
                  <option value="أرمل/ة">أرمل/ة</option>
                  <option value="مطلق/ة">مطلق/ة</option>
                  <option value="أعزب">أعزب</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">المهنة / العمل الحالي</label>
                <input name="job" value={formData.job} onChange={handleChange} type="text" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none focus:border-primary" placeholder="عامل يومية، بدون عمل، موظف..." />
              </div>
              <div>
                 <label className="block text-sm font-bold mb-2">متوسط الدخل الشهري (تقريبي)</label>
                <input name="income" value={formData.income} onChange={handleChange} type="number" dir="ltr" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none focus:border-primary" />
              </div>
            </div>
          </section>

          <section className="border-t border-outline-variant/30 pt-8">
             <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">location_on</span>
              العنوان والتواصل
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">المركز</label>
                <select name="city" value={formData.city} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none focus:border-primary">
                  <option value="بني سويف - المركز">بني سويف - المركز</option>
                  <option value="الواسطى">الواسطى</option>
                  <option value="ناصر">ناصر</option>
                  <option value="اهناسيا">اهناسيا</option>
                  <option value="ببا">ببا</option>
                  <option value="الفشن">الفشن</option>
                  <option value="سمسطا">سمسطا</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">القرية / الشياخة</label>
                <input name="village" value={formData.village} onChange={handleChange} type="text" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none focus:border-primary" />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-bold mb-2">العنوان التفصيلي</label>
                <input name="addressDetails" value={formData.addressDetails} onChange={handleChange} type="text" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 px-4 outline-none focus:border-primary" placeholder="اسم الشارع، رقم المنزل، علامة مميزة..." />
              </div>
            </div>
          </section>

          <section className="border-t border-outline-variant/30 pt-8">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold font-headline flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">group</span>
                أفراد الأسرة التابعين
              </h2>
              <div className="flex items-center gap-2 bg-surface-container-lowest rounded-lg p-1 border border-outline-variant/50">
                 <button onClick={() => updateMembersCount(membersData.length - 1)} className="w-8 h-8 rounded flex items-center justify-center hover:bg-white">−</button>
                 <span className="w-8 text-center font-bold">{membersData.length}</span>
                 <button onClick={() => updateMembersCount(membersData.length + 1)} className="w-8 h-8 rounded flex items-center justify-center hover:bg-white">+</button>
              </div>
             </div>

             <div className="space-y-4">
{membersData.map((member, i) => (
                 <div key={i} className="flex flex-col md:flex-row gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 relative">
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-outline-variant/30 flex items-center justify-center text-xs font-bold">{i+1}</div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold mb-1">الاسم</label>
                      <input type="text" value={member.name} onChange={(e) => handleMemberChange(i, 'name', e.target.value)} className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm focus:border-primary" />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-bold mb-1">السن</label>
                      <input type="number" dir="ltr" value={member.age} onChange={(e) => handleMemberChange(i, 'age', e.target.value)} className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm focus:border-primary" />
                    </div>
                    <div className="w-full md:w-48">
                      <label className="block text-xs font-bold mb-1">صلة القرابة</label>
                      <select value={member.relation} onChange={(e) => handleMemberChange(i, 'relation', e.target.value)} className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm focus:border-primary">
                        <option>ابن/ة</option>
                        <option>زوج/ة</option>
                        <option>أب/أم</option>
                        <option>أخرى</option>
                      </select>
                    </div>
                    <div className="w-full md:w-48">
                      <label className="block text-xs font-bold mb-1">المرحلة الدراسية</label>
                      <select value={member.education} onChange={(e) => handleMemberChange(i, 'education', e.target.value)} className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm focus:border-primary">
                        <option>لا يدرس</option>
                        <option>ابتدائي</option>
                        <option>إعدادي</option>
                        <option>ثانوي</option>
                        <option>جامعي</option>
                      </select>
                    </div>
                 </div>
               ))}
               {membersData.length === 0 && (
                 <p className="text-center text-sm text-on-surface-variant py-4">لا يوجد أفراد تابعين مسجلين (عائل فردي)</p>
               )}
             </div>
          </section>


          <section className="bg-white p-6 md:p-8">
             <div className="mb-6 flex justify-between items-center">
               <h2 className="text-lg font-bold font-headline flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">description</span>
                بيانات التدخل (الحالة المرتبطة بالأسرة)
              </h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">نوع التدخل المطلوب</label>
                  <select name="caseType" value={formData.caseType} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-on-surface">
                    <option>تمكين اقتصادي</option>
                    <option>تدخل طبي</option>
                    <option>سكن كريم</option>
                    <option>تعليم</option>
                    <option>أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">أولوية التدخل</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-on-surface">
                    <option>عادي</option>
                    <option>عالي</option>
                    <option>عاجل</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-on-surface mb-2">وصف الحالة / ملاحظات الباحث</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-on-surface" placeholder="اكتب تفاصيل احتياج الأسرة للتدخل..."></textarea>
                </div>
             </div>
          </section>

        </div>
        
        <div className="bg-surface-container-lowest p-6 border-t border-outline-variant/30 flex justify-end gap-3">
          <Link href="/dashboard/families" className="px-6 py-2.5 font-bold text-on-surface-variant hover:bg-outline-variant/10 rounded-xl transition-colors">
            إلغاء
          </Link>
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-primary text-white hover:bg-primary-container rounded-xl font-bold transition-colors shadow-md disabled:opacity-50">
            {loading ? "جاري التسجيل..." : "تسجيل الأسرة"}
          </button>
        </div>
      </div>
    </div>
  );
}