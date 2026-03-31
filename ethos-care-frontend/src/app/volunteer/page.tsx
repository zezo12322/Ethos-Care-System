"use client";

import PublicFooter from "@/components/layout/PublicFooter";
import PublicHeader from "@/components/layout/PublicHeader";
import { publicService } from "@/services/public.service";
import { SubmissionResponse } from "@/types/api";
import { FormEvent, useState } from "react";

const volunteerAreas = [
  "ميداني",
  "إداري",
  "إعلامي",
  "بحث اجتماعي",
  "تنظيم فعاليات",
];

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    preferredArea: volunteerAreas[0],
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<SubmissionResponse | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await publicService.submitVolunteer({
        name: formData.name,
        phone: formData.phone,
        age: formData.age ? Number(formData.age) : undefined,
        preferredArea: formData.preferredArea,
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
      <main className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold text-primary mb-6">تطوع معنا</h1>
        <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-lg text-on-surface-variant mb-8">
            النموذج الآن مرتبط بالنظام مباشرة، وسيتم حفظ طلب التطوع وإحالته للمراجعة الداخلية.
          </p>

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
                  setFormData({
                    name: "",
                    phone: "",
                    age: "",
                    preferredArea: volunteerAreas[0],
                    notes: "",
                  });
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
                  <label className="block text-sm font-bold mb-2">الاسم الرباعي</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">السن</label>
                  <input
                    type="number"
                    dir="ltr"
                    min={16}
                    max={90}
                    value={formData.age}
                    onChange={(event) => setFormData({ ...formData, age: event.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">مجال التطوع المفضل</label>
                  <select
                    value={formData.preferredArea}
                    onChange={(event) => setFormData({ ...formData, preferredArea: event.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary"
                  >
                    {volunteerAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">ملاحظات إضافية</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary resize-none"
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
