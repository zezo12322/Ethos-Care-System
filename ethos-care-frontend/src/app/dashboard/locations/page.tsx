"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'قرية', region: 'بني سويف', status: 'مفعل' });

  useEffect(() => { fetchLocations(); }, []);

  const fetchLocations = () => {
    setLoading(true);
    api.get('/locations').then(res => { setLocations(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/locations', formData);
      setIsModalOpen(false);
      setFormData({ name: '', type: 'قرية', region: 'بني سويف', status: 'مفعل' });
      fetchLocations();
    } catch (err) { console.error(err); alert("Error"); }
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm("حذف؟")) {
      try { await api.delete(`/locations/${id}`); fetchLocations(); }
      catch (err) { console.error(err); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div><h1 className="text-3xl font-bold font-headline text-on-surface">إدارة النطاق الجغرافي</h1></div>
      </div>
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="font-bold text-lg">المراكز والقرى</h2>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">موقع جديد</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant text-sm font-bold">
              <tr>
                <th className="px-6 py-4">الاسم</th><th className="px-6 py-4">تصنيف</th>
                <th className="px-6 py-4">المنطقة</th><th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
              {loading ? <tr><td colSpan={5} className="p-6 text-center text-outline">جار التحميل...</td></tr> :
               locations.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-outline">لا يوجد بيانات للمواقع</td></tr> :
               locations.map((loc) => (
                 <tr key={loc.id}>
                   <td className="px-6 py-4 font-bold">{loc.name}</td>
                   <td className="px-6 py-4 text-on-surface-variant">{loc.type}</td>
                   <td className="px-6 py-4">{loc.region}</td>
                   <td className="px-6 py-4"><span className="px-2 py-1 bg-surface-container-highest rounded text-xs leading-none">{loc.status}</span></td>
                   <td className="px-6 py-4 text-center">
                     <button onClick={() => handleDeleteLocation(loc.id)} className="w-8 h-8 rounded-full text-red-600 hover:bg-red-100"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl leading-relaxed text-right">
            <h3 className="text-xl font-bold mb-4">إضافة موقع جديد</h3>
            <form onSubmit={handleCreateLocation} className="space-y-4">
              <input required type="text" placeholder="اسم القرية/المركز" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary" />
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary">
                <option value="قرية">قرية</option>
                <option value="مركز">مركز</option>
                <option value="محافظة">محافظة</option>
              </select>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-surface-container-highest text-on-surface py-3 rounded-xl font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
