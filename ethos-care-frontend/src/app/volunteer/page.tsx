import React from 'react';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

export default function VolunteerPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest font-body">
      <PublicHeader />
      <main className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold text-primary mb-6">تطوع معنا</h1>
        <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-lg text-on-surface-variant mb-8">
            نحن سعداء برغبتك في الانضمام إلى فريق المتطوعين في صناع الحياة. يرجى ملء النموذج أدناه وسنتواصل معك قريباً.
          </p>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">الاسم الرباعي</label>
                <input type="text" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">رقم الهاتف</label>
                <input type="tel" dir="ltr" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">السن</label>
                <input type="number" dir="ltr" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">مجال التطوع المفضل</label>
                <select className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4">
                  <option>ميداني (توزيعات، زيارات)</option>
                  <option>إداري (تنظيم، أرشفة)</option>
                  <option>إعلامي (تصوير، كتابة)</option>
                </select>
              </div>
            </div>
            <button type="button" className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-container transition-colors">
              إرسال طلب التطوع
            </button>
          </form>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
