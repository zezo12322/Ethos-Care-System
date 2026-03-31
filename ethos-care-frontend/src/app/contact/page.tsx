"use client";

import PublicFooter from "@/components/layout/PublicFooter";
import PublicHeader from "@/components/layout/PublicHeader";
import { publicService } from "@/services/public.service";
import { SubmissionResponse } from "@/types/api";
import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    topic: "استفسار عام",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<SubmissionResponse | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await publicService.submitContact({
        ...formData,
        email: formData.email.trim() || undefined,
      });
      setSubmitted(response);
    } catch (submitError) {
      console.error(submitError);
      setError("تعذر إرسال الرسالة الآن. حاول مرة أخرى بعد قليل.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <PublicHeader />

      <main className="flex-1">
        <section className="bg-primary text-white py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">تواصل معنا</h1>
            <p className="text-primary-container text-lg max-w-2xl mx-auto">
              أرسل استفسارك أو شكواك مباشرة، وسيتم تسجيل الرسالة ومراجعتها من فريق الفرع.
            </p>
          </div>
        </section>

        <section className="py-20 relative bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-headline text-on-surface mb-6">معلومات الاتصال</h2>
                <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
                  يمكنك التواصل عبر النموذج أو زيارة مقر الفرع، وسيتم التعامل مع الرسائل الواردة بحسب موضوعها.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg mb-1">العنوان</h3>
                    <p className="text-on-surface-variant text-sm">حي الزهور، مقابل مسجد ثروت الدعوري، مركز بني سويف، محافظة بني سويف</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg mb-1">الهاتف</h3>
                    <p className="text-on-surface-variant text-sm" dir="ltr">01020040935</p>
                    <p className="text-on-surface-variant text-sm" dir="ltr">19222</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg mb-1">البريد الإلكتروني</h3>
                    <p className="text-on-surface-variant text-sm" dir="ltr">info@lifemakers-bns.org</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-surface p-8 rounded-3xl border border-outline-variant/30 shadow-[0px_8px_24px_-8px_rgba(0,40,38,0.06)]">
                <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">أرسل لنا رسالة</h2>
                <p className="text-on-surface-variant text-sm mb-8">
                  يتم الآن حفظ الرسالة مباشرة في النظام بدل نموذج تجريبي.
                </p>

                {submitted ? (
                  <div className="bg-green-50 text-green-800 p-8 rounded-2xl border border-green-200 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <h3 className="font-bold text-xl mb-2">تم استلام رسالتك بنجاح</h3>
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
                          email: "",
                          topic: "استفسار عام",
                          message: "",
                        });
                      }}
                      className="mt-6 px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
                    >
                      إرسال رسالة أخرى
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
                        <label className="block text-sm font-bold mb-2">الاسم بالكامل <span className="text-error">*</span></label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                          className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary transition-colors"
                          placeholder="الاسم الثلاثي"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">رقم الهاتف <span className="text-error">*</span></label>
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={formData.phone}
                          onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                          className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary text-right transition-colors"
                          placeholder="01xxxxxxxxx"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                        <input
                          type="email"
                          dir="ltr"
                          value={formData.email}
                          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                          className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary text-right transition-colors"
                          placeholder="example@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">موضوع الرسالة <span className="text-error">*</span></label>
                        <select
                          required
                          value={formData.topic}
                          onChange={(event) => setFormData({ ...formData, topic: event.target.value })}
                          className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary transition-colors"
                        >
                          <option value="استفسار عام">استفسار عام</option>
                          <option value="التطوع بالفرع">التطوع بالفرع</option>
                          <option value="التبرع والمساهمات">التبرع والمساهمات</option>
                          <option value="شكوى أو مقترح">شكوى أو مقترح</option>
                          <option value="متابعة طلب مساعدة">متابعة طلب مساعدة</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">نص الرسالة <span className="text-error">*</span></label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                        className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary resize-none transition-colors"
                        placeholder="اكتب رسالتك أو استفسارك بوضوح هنا..."
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-primary text-white hover:bg-primary-container rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
                        <span className="material-symbols-outlined text-[20px] rtl:rotate-180">send</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
