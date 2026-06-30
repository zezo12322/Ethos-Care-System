"use client";

import PublicFooter from "@/components/layout/PublicFooter";
import PublicHeader from "@/components/layout/PublicHeader";
import { publicService } from "@/services/public.service";
import { SubmissionResponse } from "@/types/api";
import { FormEvent, useState } from "react";

const CENTERS = [
  "بني سويف - المركز",
  "الواسطى",
  "ناصر",
  "اهناسيا",
  "ببا",
  "الفشن",
  "سمسطا",
];

const EDUCATION_LEVELS = [
  "طالب",
  "محو أمية",
  "ابتدائية",
  "إعدادية",
  "ثانوية / دبلوم",
  "بكالوريوس / ليسانس",
  "دراسات عليا",
  "أخرى",
];

const ACTIVITIES = [
  "ميداني",
  "إداري",
  "إعلامي",
  "بحث اجتماعي",
  "تنظيم فعاليات",
  "جمع تبرعات",
  "تعليمي",
  "طبي / صحي",
  "أخرى",
];

const emptyForm = {
  name: "",
  phone: "",
  nationalId: "",
  birthDate: "",
  education: "",
  schoolYear: "",
  center: "",
  whatsapp: "",
  email: "",
  address: "",
  preferredArea: "",
  notes: "",
};

const fieldClass =
  "w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary";

export default function VolunteerPage() {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<SubmissionResponse | null>(null);

  const set = (key: keyof typeof emptyForm, value: string) =>
    setFormData((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("يرجى إدخال الاسم ورقم التليفون.");
      return;
    }
    if (!formData.preferredArea) {
      setError("يرجى اختيار النشاط الذي تود التطوع فيه.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const response = await publicService.submitVolunteer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        preferredArea: formData.preferredArea,
        nationalId: formData.nationalId.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        education: formData.education || undefined,
        schoolYear: formData.schoolYear.trim() || undefined,
        center: formData.center || undefined,
        whatsapp: formData.whatsapp.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
      setSubmitted(response);
    } catch (submitError) {
      console.error(submitError);
      setError("تعذر إرسال طلب التطوع الآن. حاول مرة أخرى بعد قليل.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest font-body">
      <PublicHeader />
      <main className="max-w-5xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold text-primary mb-6">تطوع معنا</h1>
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-sm">
          {submitted ? (
            <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center text-green-900">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">تم استلام طلب التطوع</h2>
              <p className="text-sm">{submitted.message}</p>
              <p className="text-xs mt-3 opacity-80">
                {new Date(submitted.submittedAt).toLocaleString("ar-EG")}
              </p>
              <button
                onClick={() => {
                  setSubmitted(null);
                  setFormData(emptyForm);
                }}
                className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                إرسال طلب جديد
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-bold text-error">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">الاسم الثلاثي</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="اسمك بالكامل"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">رقم التليفون</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="رقم التليفون"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">الرقم القومي</label>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={14}
                    value={formData.nationalId}
                    onChange={(e) => set("nationalId", e.target.value.replace(/\D/g, ""))}
                    placeholder="تأكد من رقم البطاقة"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => set("birthDate", e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">المؤهل الدراسي</label>
                  <select
                    value={formData.education}
                    onChange={(e) => set("education", e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">-- المؤهل الدراسي --</option>
                    {EDUCATION_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">السنة الدراسية</label>
                  <input
                    type="text"
                    value={formData.schoolYear}
                    onChange={(e) => set("schoolYear", e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">حدد المركز</label>
                  <select
                    value={formData.center}
                    onChange={(e) => set("center", e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">-حدد المركز-</option>
                    {CENTERS.map((center) => (
                      <option key={center} value={center}>
                        {center}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">رقم الواتس اب</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={formData.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">
                    العنوان بالتفصيل (محافظة - مركز - قرية)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="العنوان بالتفصيل"
                    className={fieldClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">
                    ماهو النشاط الذي تود التطوع فيه؟
                  </label>
                  <select
                    value={formData.preferredArea}
                    onChange={(e) => set("preferredArea", e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">- اختر -</option>
                    {ACTIVITIES.map((activity) => (
                      <option key={activity} value={activity}>
                        {activity}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">ملاحظات</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className={`${fieldClass} resize-none`}
                  placeholder="اكتب أي خبرات، مواعيد مناسبة، أو مجالات تفضل المشاركة فيها."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-container transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "جارٍ إرسال الطلب..." : "إرسال طلب التطوع"}
              </button>
            </form>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
