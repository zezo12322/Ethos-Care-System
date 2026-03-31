"use client";

import { locationsService } from "@/services/locations.service";
import { LocationRecord } from "@/types/api";
import { FormEvent, useEffect, useState } from "react";

const emptyForm = {
  name: "",
  type: "قرية",
  region: "بني سويف",
  status: "مفعل",
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    const loadLocations = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await locationsService.getAll();
        if (active) {
          setLocations(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (active) {
          setError("تعذر تحميل المواقع الآن.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadLocations();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refreshLocations = () => setReloadKey((current) => current + 1);

  const handleCreateLocation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await locationsService.create(formData);
      setIsModalOpen(false);
      setFormData(emptyForm);
      refreshLocations();
    } catch (createError) {
      console.error(createError);
      setError("تعذر إنشاء الموقع الآن.");
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm("هل تريد حذف هذا الموقع؟")) {
      return;
    }

    setError("");

    try {
      await locationsService.remove(id);
      refreshLocations();
    } catch (deleteError) {
      console.error(deleteError);
      setError("تعذر حذف الموقع الآن.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">إدارة النطاق الجغرافي</h1>
          <p className="text-sm text-on-surface-variant mt-1">ربط القرى والمراكز بالنطاق الإداري الفعلي المستخدم في تسجيل الحالات.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-bold text-error">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="font-bold text-lg">المراكز والقرى</h2>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">
            موقع جديد
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant text-sm font-bold">
              <tr>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">المنطقة</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-outline">جار التحميل...</td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-outline">لا يوجد بيانات للمواقع</td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.id}>
                    <td className="px-6 py-4 font-bold">{location.name}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{location.type}</td>
                    <td className="px-6 py-4">{location.region}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-surface-container-highest rounded text-xs leading-none">
                        {location.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDeleteLocation(location.id)} className="w-8 h-8 rounded-full text-red-600 hover:bg-red-100">
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
            <h3 className="text-xl font-bold mb-4">إضافة موقع جديد</h3>
            <form onSubmit={handleCreateLocation} className="space-y-4">
              <input
                required
                type="text"
                placeholder="اسم القرية/المركز"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <select
                value={formData.type}
                onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              >
                <option value="قرية">قرية</option>
                <option value="مركز">مركز</option>
                <option value="محافظة">محافظة</option>
              </select>
              <input
                type="text"
                placeholder="المنطقة أو المحافظة"
                value={formData.region}
                onChange={(event) => setFormData({ ...formData, region: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <select
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              >
                <option value="مفعل">مفعل</option>
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
