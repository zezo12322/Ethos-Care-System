"use client";

import { useAuth } from "@/contexts/AuthContext";
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
  const { user, loading: authLoading } = useAuth();
  const canManagePartners = user?.role === "ADMIN" || user?.role === "CEO";

  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (authLoading || !canManagePartners) {
      setLoading(false);
      return;
    }

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
  }, [authLoading, canManagePartners, reloadKey]);

  const refreshPartners = () => setReloadKey((current) => current + 1);

  const resetModal = () => {
    setEditingPartnerId(null);
    setFormData(emptyForm);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setFeedback("");
    setError("");
    setEditingPartnerId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (partner: PartnerRecord) => {
    setFeedback("");
    setError("");
    setEditingPartnerId(partner.id);
    setFormData({
      name: partner.name,
      type: partner.type || "مؤسسة مانحة",
      contact: partner.contact || "",
      email: partner.email || "",
      status: partner.status || "نشط",
      image: partner.image || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFeedback("");

    const payload = {
      ...formData,
      contact: formData.contact.trim() || undefined,
      email: formData.email.trim() || undefined,
      image: formData.image.trim() || undefined,
    };

    try {
      if (editingPartnerId) {
        await partnersService.update(editingPartnerId, payload);
        setFeedback("تم تحديث بيانات الشريك بنجاح.");
      } else {
        await partnersService.create(payload);
        setFeedback("تم إضافة الشريك بنجاح.");
      }

      resetModal();
      refreshPartners();
    } catch (submitError) {
      console.error(submitError);
      setError(
        editingPartnerId
          ? "تعذر تحديث بيانات الشريك الآن."
          : "تعذر إضافة الشريك الآن.",
      );
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!window.confirm("هل تريد حذف هذا الشريك؟")) {
      return;
    }

    setError("");
    setFeedback("");

    try {
      await partnersService.remove(id);
      setFeedback("تم حذف الشريك بنجاح.");
      refreshPartners();
    } catch (deleteError) {
      console.error(deleteError);
      setError("تعذر حذف الشريك الآن.");
    }
  };

  if (authLoading) {
    return <div className="text-sm text-on-surface-variant">جارٍ التحقق من الصلاحيات...</div>;
  }

  if (!canManagePartners) {
    return (
      <div className="rounded-3xl border border-outline-variant/30 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-on-surface">إدارة الشركاء</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          هذه الصفحة متاحة فقط لمدير النظام والمدير التنفيذي.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">
            إدارة الشركاء
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            صلاحية تنفيذية مباشرة لإضافة وتعديل وإيقاف الشركاء والجهات الداعمة.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white"
        >
          شريك جديد
        </button>
      </div>

      {(error || feedback) && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-bold ${
            error
              ? "border border-error/20 bg-error/5 text-error"
              : "border border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {error || feedback}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-outline-variant/20 bg-white p-5">
          <div className="text-sm text-on-surface-variant">إجمالي الشركاء</div>
          <div className="mt-2 text-3xl font-bold text-on-surface">
            {partners.length}
          </div>
        </div>
        <div className="rounded-3xl border border-outline-variant/20 bg-white p-5">
          <div className="text-sm text-on-surface-variant">الشركاء النشطون</div>
          <div className="mt-2 text-3xl font-bold text-success">
            {partners.filter((partner) => partner.status === "نشط").length}
          </div>
        </div>
        <div className="rounded-3xl border border-outline-variant/20 bg-white p-5">
          <div className="text-sm text-on-surface-variant">الموقوفون</div>
          <div className="mt-2 text-3xl font-bold text-error">
            {partners.filter((partner) => partner.status !== "نشط").length}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-white">
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
          <h2 className="text-lg font-bold text-on-surface">سجل الشركاء</h2>
          <button
            onClick={refreshPartners}
            className="rounded-2xl bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface"
          >
            تحديث
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-surface-container-lowest text-sm font-bold text-on-surface-variant">
              <tr>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">التواصل</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    جار التحميل...
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    لا يوجد شركاء مسجلون حتى الآن.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id}>
                    <td className="px-6 py-4 font-bold text-on-surface">{partner.name}</td>
                    <td className="px-6 py-4 text-on-surface">{partner.type}</td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      <div dir="ltr">{partner.contact || "بدون رقم"}</div>
                      <div className="mt-1 text-xs" dir="ltr">
                        {partner.email || "بدون بريد"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          partner.status === "نشط"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(partner)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-tertiary hover:bg-tertiary/10"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-error hover:bg-error/10"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-on-surface">
                {editingPartnerId ? "تعديل بيانات الشريك" : "إضافة شريك جديد"}
              </h3>
              <button
                type="button"
                onClick={resetModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                type="text"
                placeholder="اسم الشريك"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="نوع الشريك"
                value={formData.type}
                onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="رقم التواصل"
                value={formData.contact}
                onChange={(event) => setFormData({ ...formData, contact: event.target.value })}
                className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="رابط الشعار أو الصورة"
                value={formData.image}
                onChange={(event) => setFormData({ ...formData, image: event.target.value })}
                className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
              />
              <select
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
              >
                <option value="نشط">نشط</option>
                <option value="موقوف">موقوف</option>
              </select>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white"
                >
                  {editingPartnerId ? "حفظ التعديلات" : "حفظ الشريك"}
                </button>
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 rounded-2xl bg-surface-container-highest py-3 text-sm font-bold text-on-surface"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
