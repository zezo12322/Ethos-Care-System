"use client";

import { partnersService } from "@/services/partners.service";
import { PartnerRecord } from "@/types/api";
import { FormEvent, useEffect, useState } from "react";

const emptyForm = {
  name: "",
  type: "مؤسسة مانحة",
  contact: "",
  email: "",
  status: "نشط",
  image: "",
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    const loadPartners = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await partnersService.getAll();
        if (active) {
          setPartners(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (active) {
          setError("تعذر تحميل بيانات الشركاء الآن.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadPartners();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refreshPartners = () => setReloadKey((current) => current + 1);

  const handleCreatePartner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await partnersService.create({
        ...formData,
        contact: formData.contact.trim() || undefined,
        email: formData.email.trim() || undefined,
        image: formData.image.trim() || undefined,
      });
      setIsModalOpen(false);
      setFormData(emptyForm);
      refreshPartners();
    } catch (createError) {
      console.error(createError);
      setError("تعذر إضافة الشريك الآن.");
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!window.confirm("هل تريد حذف هذا الشريك؟")) {
      return;
    }

    setError("");

    try {
      await partnersService.remove(id);
      refreshPartners();
    } catch (deleteError) {
      console.error(deleteError);
      setError("تعذر حذف الشريك الآن.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">إدارة الشركاء</h1>
          <p className="text-sm text-on-surface-variant mt-1">تنظيم الجهات الداعمة ومعلومات التواصل الخاصة بها من خلال contract موحد.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-bold text-error">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="font-bold text-lg">الشركاء والمؤسسات</h2>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">
            شريك جديد
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant text-sm font-bold">
              <tr>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">التواصل</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-outline">جار التحميل...</td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-outline">لا يوجد بيانات للشركاء</td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id}>
                    <td className="px-6 py-4 font-bold">{partner.name}</td>
                    <td className="px-6 py-4">{partner.type}</td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      <p dir="ltr">{partner.contact || "بدون رقم"}</p>
                      <p className="text-xs mt-1" dir="ltr">{partner.email || "بدون بريد"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-surface-container-highest rounded text-xs leading-none">
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDeletePartner(partner.id)} className="w-8 h-8 rounded-full text-red-600 hover:bg-red-100">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl leading-relaxed text-right">
            <h3 className="text-xl font-bold mb-4">إضافة شريك جديد</h3>
            <form onSubmit={handleCreatePartner} className="space-y-4">
              <input
                required
                type="text"
                placeholder="اسم الشريك"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="نوع الشريك"
                value={formData.type}
                onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="رقم التواصل"
                value={formData.contact}
                onChange={(event) => setFormData({ ...formData, contact: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="رابط الشعار أو الصورة"
                value={formData.image}
                onChange={(event) => setFormData({ ...formData, image: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <select
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              >
                <option value="نشط">نشط</option>
                <option value="موقوف">موقوف</option>
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
