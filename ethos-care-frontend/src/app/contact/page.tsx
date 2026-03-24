"use client";

import React, { useState } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    topic: "general",
    message: ""
  });
  
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful form submission
    setTimeout(() => {
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <PublicHeader />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-primary text-white py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">تواصل معنا</h1>
            <p className="text-primary-container text-lg max-w-2xl mx-auto">
              نحن هنا للإجابة على استفساراتكم وشكواكم. لا تترددوا في التواصل مع فريق أجيال صناع الحياة ببني سويف.
            </p>
          </div>
        </section>

        <section className="py-20 relative bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            
            {/* Contact Info (Side) */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-headline text-on-surface mb-6">معلومات الاتصال</h2>
                <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
                  يمكنك زيارة مقرنا الرئيسي في بني سويف لمقابلتنا شخصياً، أو استخدام أرقام الهواتف والبريد الإلكتروني المدونة أدناه للتواصل السريع.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg mb-1">العنوان</h3>
                    <p className="text-on-surface-variant text-sm">حي الزهور الشارع المقابل لمسجد ثروت الدعوري  مركز بني سويف محافظة بني سويف</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg mb-1">الهاتف المحمول وأرضي</h3>
                    <p className="text-on-surface-variant text-sm" dir="ltr">01020040935</p>
                    <p className="text-on-surface-variant text-sm" dir="ltr">19222 (رقم مختصر)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg mb-1">البريد الإلكتروني</h3>
                    <p className="text-on-surface-variant text-sm" dir="ltr">info.benisuef@lifemakers.org</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-outline-variant/20">
                <h3 className="font-bold text-on-surface mb-4">مواعيد العمل</h3>
                <div className="flex justify-between items-center text-sm text-on-surface-variant mb-2">
                  <span>الأحد - الخميس</span>
                  <span>9:00 ص - 5:00 م</span>
                </div>
                <div className="flex justify-between items-center text-sm text-error font-bold">
                  <span>الجمعة والسبت</span>
                  <span>عطلة رسمية</span>
                </div>
              </div>
            </div>

            {/* Contact Form (Main) */}
            <div className="lg:col-span-3">
              <div className="bg-surface p-8 rounded-3xl border border-outline-variant/30 shadow-[0px_8px_24px_-8px_rgba(0,40,38,0.06)]">
                <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">أرسل لنا رسالة</h2>
                <p className="text-on-surface-variant text-sm mb-8">قم بملء النموذج التالي وسيقوم أحد ممثلي خدمة العملاء بالتواصل معك في أقرب وقت.</p>

                {submitted ? (
                  <div className="bg-green-50 text-green-800 p-8 rounded-2xl border border-green-200 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <h3 className="font-bold text-xl mb-2">تم استلام رسالتك بنجاح!</h3>
                    <p className="text-sm">نشكرك على تواصلك معنا، سنقوم بالرد عليك قريباً.</p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="mt-6 px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
                    >
                      إرسال رسالة أخرى
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold mb-2">الاسم بالكامل <span className="text-error">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary text-right transition-colors" 
                          placeholder="example@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">موضوع الرسالة <span className="text-error">*</span></label>
                        <select 
                          required
                          value={formData.topic}
                          onChange={(e) => setFormData({...formData, topic: e.target.value})}
                          className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary transition-colors"
                        >
                          <option value="general">استفسار عام</option>
                          <option value="volunteer">التطوع بالفرع</option>
                          <option value="donation">التبرع والمساهمات</option>
                          <option value="complaint">شكوى أو مقترح</option>
                          <option value="aid">متابعة طلب مساعدة</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">نص الرسالة <span className="text-error">*</span></label>
                      <textarea 
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary resize-none transition-colors" 
                        placeholder="اكتب رسالتك أو استفسارك بوضوح هنا..."
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit" 
                        className="px-8 py-3 bg-primary text-white hover:bg-primary-container rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2"
                      >
                        إرسال الرسالة
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