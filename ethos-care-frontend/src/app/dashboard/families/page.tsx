"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { familiesService } from "@/services/families.service";
import { FamilyRecord } from "@/types/api";

interface EditingFamilyState {
  id: string;
  headName: string;
  membersCount: number;
  income: string;
  address: string;
  phone: string;
  status: string;
}

export default function FamiliesPage() {
  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<EditingFamilyState | null>(null);

  const fetchFamilies = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const data = await familiesService.getAll();
      setFamilies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFamilies(false);
  }, []);

  const handleEditClick = (f: FamilyRecord) => {
    setEditingFamily({
      id: f.id,
      headName: f.headName,
      membersCount: f.membersCount,
      income: (f.income || "").replace(' ج.م', ''),
      address: f.address || "",
      phone: f.phone || "",
      status: f.status
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFamily) return;

    try {
      await familiesService.update(editingFamily.id, {
        headName: editingFamily.headName,
        membersCount: editingFamily.membersCount,
        income: editingFamily.income,
        address: editingFamily.address,
        phone: editingFamily.phone,
        status: editingFamily.status
      });
      setIsEditModalOpen(false);
      setEditingFamily(null);
      await fetchFamilies();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تعديل بيانات الأسرة");
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الأسرة؟")) {
      try {
        await familiesService.remove(id);
        await fetchFamilies();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredFamilies = families.filter((family) => {
    if (!search.trim()) return true;
    return (
      family.headName.includes(search) ||
      family.id.includes(search) ||
      (family.nationalId || "").includes(search) ||
      (family.phone || "").includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">إدارة ملفات الأسر</h1>
          <p className="text-on-surface-variant mt-1 text-sm">أرشفة وتقييم بيانات الأسر المستحقة بقرى ومراكز בני سويف</p>
        </div>
        <Link href="/dashboard/families/new" className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined">add</span>
          إضافة ملف أسرة
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex flex-wrap gap-4 items-center justify-between bg-surface-container-lowest/50">
           <div className="flex items-center gap-2 bg-white border border-outline-variant/50 rounded-xl px-3 py-2 w-full md:w-96 focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline">search</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الرقم القومي..." className="bg-transparent border-none outline-none w-full text-sm placeholder:text-outline" />
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
            تصفية متقدمة
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-surface-container-lowest text-on-surface-variant text-sm border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 font-bold">اسم العائل / رقم الملف</th>
                <th className="px-6 py-4 font-bold">أفراد الأسرة</th>
                <th className="px-6 py-4 font-bold">متوسط الدخل</th>
                <th className="px-6 py-4 font-bold">العنوان</th>
                <th className="px-6 py-4 font-bold">آخر زيارة</th>
                <th className="px-6 py-4 font-bold">حالة التقييم</th>
                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-outline">جارٍ التحميل...</td></tr>
              ) : filteredFamilies.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-outline">لا يوجد أسر مسجلة حالياً</td></tr>
              ) : (
                filteredFamilies.map((family) => (
                <tr key={family.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-on-surface">{family.headName}</p>
                    <p className="text-xs text-on-surface-variant font-mono mt-1">{family.id.substring(0,8)}...</p>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-lg text-xs font-bold text-on-surface">
                        <span className="material-symbols-outlined text-[14px]">groups</span>
                        {family.membersCount} أفراد
                     </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-left" dir="ltr">{family.income}</td>
                  <td className="px-6 py-4 text-on-surface-variant max-w-[200px] truncate">{family.address}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{family.lastVisit}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      family.status === "مستحق" ? "bg-green-100 text-green-800" :
                      family.status === "غير مستحق" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {family.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Link href={`/dashboard/families/${family.id}`} title="تفاصيل الأسرة" className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                       </Link>
                       <button onClick={() => handleEditClick(family)} title="تعديل" className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                       </button>
                       <button onClick={() => handleDeleteClick(family.id)} title="حذف" className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                       </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingFamily && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl leading-relaxed">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">تعديل بيانات الأسرة</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleUpdateFamily} className="space-y-4 text-right">
              <div>
                <label className="block text-sm font-bold mb-2">اسم العائل</label>
                <input required type="text" value={editingFamily.headName} onChange={e => setEditingFamily({...editingFamily, headName: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">عدد الأفراد</label>
                  <input required type="number" value={editingFamily.membersCount} onChange={e => setEditingFamily({...editingFamily, membersCount: Number(e.target.value) || 1})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">متوسط الدخل</label>
                  <input required type="number" value={editingFamily.income} onChange={e => setEditingFamily({...editingFamily, income: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">العنوان</label>
                <input required type="text" value={editingFamily.address} onChange={e => setEditingFamily({...editingFamily, address: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">الهاتف</label>
                <input required type="text" value={editingFamily.phone} onChange={e => setEditingFamily({...editingFamily, phone: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none text-left focus:border-primary" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">حالة التقييم</label>
                <select value={editingFamily.status} onChange={e => setEditingFamily({...editingFamily, status: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary">
                  <option value="تحت التقييم">تحت التقييم</option>
                  <option value="مستحق">مستحق</option>
                  <option value="غير مستحق">غير مستحق</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-container transition-colors">حفظ التعديلات</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-surface-container-highest text-on-surface py-3 rounded-xl font-bold hover:bg-surface-container-high transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
