"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { publicService } from "@/services/public.service";
import { RequestAidPayload, RequestAidResponse } from "@/types/api";

const aidTypes = [
  "تدخل طبي",
  "تمكين اقتصادي",
  "سكن كريم",
  "دعم تعليمي",
];

const cityOptions = [
  "بني سويف",
  "الواسطى",
  "ناصر",
  "إهناسيا",
  "ببا",
  "الفشن",
  "سمسطا",
];

export default function RequestAidPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RequestAidResponse | null>(null);
  const [formData, setFormData] = useState<RequestAidPayload>({
    applicantName: "",
    nationalId: "",
    phone: "",
    city: "",
    village: "",
    aidType: aidTypes[0],
    description: "",
    addressDetails: "",
  });

  const updateField = (field: keyof RequestAidPayload, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const goToStep = (nextStep: number) => {
    if (nextStep === 2) {
      if (!formData.applicantName.trim() || !formData.phone.trim() || !formData.city.trim()) {
        setError("أكمل الاسم ورقم الهاتف والمدينة قبل الانتقال للخطوة التالية.");
        return;
      }
    }

    if (nextStep === 3) {
      if (!formData.aidType.trim() || formData.description.trim().length < 10) {
        setError("أدخل نوع المساعدة ووصفًا واضحًا للحالة قبل المراجعة النهائية.");
        return;
      }
    }

    setError("");
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const response = await publicService.requestAid({
        ...formData,
        nationalId: formData.nationalId?.trim() || undefined,
        village: formData.village?.trim() || undefined,
        addressDetails: formData.addressDetails?.trim() || undefined,
      });

      setResult(response);
    } catch (submitError) {
      console.error(submitError);
      setError("تعذر إرسال الطلب الآن. حاول مرة أخرى بعد قليل.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest font-body flex flex-col">
      <header className="bg-white border-b border-outline-variant/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="شعار صناع الحياة" width={48} height={48} className="w-12 h-12 object-contain" />
            <span className="font-headline font-bold text-xl text-primary">أجيال صناع الحياة</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
          >
            العودة للرئيسية
            <span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_back</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-headline text-primary mb-3">طلب مساعدة جديد</h1>
          <p className="text-on-surface-variant">
            أدخل البيانات الأساسية للحالة، وسيتم تسجيل الطلب فورًا وإعطاؤك رقم متابعة يمكن التحقق به لاحقًا.
          </p>
        </div>

        <div className="flex items-center justify-center mb-10 gap-2">
          <div className={`p-2 rounded-full border-2 ${step >= 1 ? "border-primary bg-primary text-white" : "border-outline-variant/50 text-outline"} flex items-center justify-center w-10 h-10 font-bold transition-all`}>1</div>
          <div className={`h-1 w-16 md:w-32 rounded-full ${step >= 2 ? "bg-primary" : "bg-surface-container-highest"} transition-colors`}></div>
          <div className={`p-2 rounded-full border-2 ${step >= 2 ? "border-primary bg-primary text-white" : "border-outline-variant/50 border-dashed text-outline"} flex items-center justify-center w-10 h-10 font-bold transition-all`}>2</div>
          <div className={`h-1 w-16 md:w-32 rounded-full ${step >= 3 ? "bg-primary" : "bg-surface-container-highest"} transition-colors`}></div>
          <div className={`p-2 rounded-full border-2 ${step >= 3 ? "border-primary bg-primary text-white" : "border-outline-variant/50 border-dashed text-outline"} flex items-center justify-center w-10 h-10 font-bold transition-all`}>3</div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-outline-variant/30">
          {error && (
            <div className="mb-6 rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-bold text-error">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold font-headline border-b border-outline-variant/30 pb-4 mb-6">البيانات الأساسية</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">الاسم الرباعي <span className="text-error">*</span></label>
                  <input
                    type="text"
                    value={formData.applicantName}
                    onChange={(event) => updateField("applicantName", event.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">الرقم القومي</label>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={14}
                    value={formData.nationalId}
                    onChange={(event) => updateField("nationalId", event.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">رقم التليفون <span className="text-error">*</span></label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">المركز / المدينة <span className="text-error">*</span></label>
                  <select
                    value={formData.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">اختر المدينة...</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">القرية / الحي</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(event) => updateField("village", event.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">العنوان التفصيلي</label>
                  <input
                    type="text"
                    value={formData.addressDetails}
                    onChange={(event) => updateField("addressDetails", event.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => goToStep(2)}
                  className="w-full md:w-auto mr-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white hover:bg-primary-container rounded-xl font-bold transition-all shadow-md"
                >
                  التالي
                  <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold font-headline border-b border-outline-variant/30 pb-4 mb-6">تفاصيل الحالة</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-3">نوع المساعدة المطلوبة <span className="text-error">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aidTypes.map((aidType) => (
                      <label
                        key={aidType}
                        className="flex items-center gap-3 p-4 border border-outline-variant/50 rounded-xl cursor-pointer hover:bg-surface-container-low"
                      >
                        <input
                          type="radio"
                          name="aid_type"
                          className="w-5 h-5 accent-primary"
                          checked={formData.aidType === aidType}
                          onChange={() => updateField("aidType", aidType)}
                        />
                        <span className="font-bold">{aidType}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">وصف الحالة ولمبررات الطلب <span className="text-error">*</span></label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    placeholder="اكتب هنا تفاصيل المشكلة، الوضع المعيشي، وطبيعة التدخل المطلوب."
                  ></textarea>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors"
                >
                  السابق
                </button>
                <button
                  onClick={() => goToStep(3)}
                  className="px-8 py-3.5 bg-primary text-white hover:bg-primary-container rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                >
                  مراجعة الطلب
                  <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {result ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                  </div>
                  <h2 className="text-2xl font-bold font-headline mb-2">تم تسجيل طلبك بنجاح</h2>
                  <p className="text-on-surface-variant text-sm max-w-md mx-auto leading-relaxed mb-6">
                    {result.message}
                  </p>

                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 text-right inline-block min-w-[300px]">
                    <p className="text-xs text-on-surface-variant mb-1">رقم الطلب</p>
                    <p className="text-2xl font-bold font-headline text-primary tracking-widest" dir="ltr">
                      {result.requestId}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href={`/verify?type=request&id=${result.requestId}`}
                      className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-container transition-colors"
                    >
                      متابعة حالة الطلب
                    </Link>
                    <Link
                      href="/"
                      className="px-6 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold hover:bg-surface-container-high transition-colors"
                    >
                      العودة للرئيسية
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 space-y-4">
                    <h2 className="text-xl font-bold font-headline">مراجعة نهائية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-on-surface-variant">الاسم</p>
                        <p className="font-bold">{formData.applicantName}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant">الهاتف</p>
                        <p className="font-bold" dir="ltr">{formData.phone}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant">الموقع</p>
                        <p className="font-bold">
                          {[formData.village, formData.city].filter(Boolean).join(" - ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant">نوع المساعدة</p>
                        <p className="font-bold">{formData.aidType}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-sm mb-2">وصف الحالة</p>
                      <p className="text-sm leading-7">{formData.description}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-outline-variant/30 flex items-center justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-3.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors"
                    >
                      السابق وتعديل
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-8 py-3.5 bg-[#fcb900] text-on-surface hover:bg-[#e5a800] rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "جارٍ الإرسال..." : "تأكيد وإرسال الطلب"}
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
