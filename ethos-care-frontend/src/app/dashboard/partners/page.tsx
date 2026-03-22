"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'مؤسسة مانحة', contact: '', email: '', status: 'نشط' });

  useEffect(() => { fetchPartners(); }, []);

  const fetchPartners = () => {
    setLoading(true);
    api.get('/partners').then(res => { setPartners(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/partners', formData);
      setIsModalOpen(false);
      setFormData({ name: '', type: 'مؤسسة مانحة', contact: '', email: '', status: 'نشط' });
      fetchPartners();
    } catch (err) { console.error(err); alert("Error"); }
  };

  const handleDeletePartner = async (id: string) => {
    if (confirm("حذف؟")) {
      try { await api.delete(`/partners/${id}`); fetchPartners(); }
      catch (err) { console.error(err); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div><h1 className="text-3xl font-bold font-headline text-on-surface">إدارة الشركاء</h1></div>
      </div>
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="font-bold text-lg">الشركاء والمؤسسات</h2>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">شريك جديد</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant text-sm font-bold">
              <tr>
                <th className="px-6 py-4">الاسم</th><th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">التواصل</th><th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
              {loading ? <tr><td colSpan={5} className="p-6 text-center text-outline">جار التحميل...</td></tr> :
               partners.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-outline">لا يوجد بيانات للشركاء</td></tr> :
               partners.map((p) => (
                 <tr key={p.id}>
                   <td className="px-6 py-4 font-bold">{p.name}</td>
                   <td className="px-6 py-4">{p.type}</td>
                   <td className="px-6 py-4 text-on-surface-variant font-mono">{p.contact} <br/><span className="text-xs">{p.email}</span></td>
                   <td className="px-6 py-4"><span className="px-2 py-1 bg-surface-container-highest rounded text-xs leading-none">{p.status}</span></td>
                   <td className="px-6 py-4 text-center">
                     <button onClick={() => handleDeletePartner(p.id)} className="w-8 h-8 rounded-full text-red-600 hover:bg-red-100"><span className="material-symbols-outlined text-[18px]">delete</span></button>
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
            <h3 className="text-xl font-bold mb-4">إضافة شريك جديد</h3>
            <form onSubmit={handleCreatePartner} className="space-y-4">
              <input required type="text" placeholder="اسم الشريك" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary" />
              <input type="text" placeholder="رقم المتواصل" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary" />
              <input type="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary" />
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
