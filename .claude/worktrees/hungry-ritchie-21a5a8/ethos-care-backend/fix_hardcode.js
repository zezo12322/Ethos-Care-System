const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ethos-care-frontend/src/app/dashboard/families/[id]/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Replace standard stats hardcodes
code = code.replace(
  /<span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold font-body">مستحق<\/span>/g,
  '<span className="px-3 py-1 bg-surface-container-high text-on-surface rounded-full text-xs font-bold font-body">{family.status || "تحت التقييم"}</span>'
);

code = code.replace(
  /<p className="text-xl font-bold" dir="ltr">1200 EGP<\/p>/g,
  '<p className="text-xl font-bold" dir="ltr">{family.income || 0} EGP</p>'
);

code = code.replace(
  /<p className="text-xl font-bold text-\\[#a37600\\]">مرتفع جداً<\/p>/g,
  '<p className="text-xl font-bold text-[#a37600]">{family.status === "مستحق" ? "احتياج مرتفع" : "قيد الدراسة"}</p>'
);

code = code.replace(
  /<p className="text-sm font-bold mt-1" dir="ltr">15 أكتوبر 2024<\/p>/g,
  `<p className="text-sm font-bold mt-1" dir="ltr">
              {family.lastVisit ? new Date(family.lastVisit).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير متوفر'}
            </p>`
);

// Replace Members Table Target
const membersTableSearch = `<tbody className="divide-y divide-outline-variant/20">
                    <tr className="hover:bg-surface-container-lowest/50">
                      <td className="px-5 py-3 font-bold">زينب علي حسن</td>
                      <td className="px-5 py-3">زوجة</td>
                      <td className="px-5 py-3 text-center">38</td>
                      <td className="px-5 py-3">لا تدرس</td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest/50">
                      <td className="px-5 py-3 font-bold">أحمد محمود عبدالرحمن</td>
                      <td className="px-5 py-3">ابن</td>
                      <td className="px-5 py-3 text-center">15</td>
                      <td className="px-5 py-3">إعدادي</td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest/50">
                      <td className="px-5 py-3 font-bold">فاطمة محمود عبدالرحمن</td>
                      <td className="px-5 py-3">ابنة</td>
                      <td className="px-5 py-3 text-center">12</td>
                      <td className="px-5 py-3">ابتدائي</td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest/50">
                      <td className="px-5 py-3 font-bold">يوسف محمود عبدالرحمن</td>
                      <td className="px-5 py-3">ابن</td>
                      <td className="px-5 py-3 text-center">8</td>
                      <td className="px-5 py-3">ابتدائي</td>
                    </tr>
                  </tbody>`;

const membersTableReplace = `<tbody className="divide-y divide-outline-variant/20">
                    <tr className="hover:bg-surface-container-lowest/50">
                      <td className="px-5 py-3 font-bold">{family.headName}</td>
                      <td className="px-5 py-3">عائل الأسرة</td>
                      <td className="px-5 py-3 text-center">-</td>
                      <td className="px-5 py-3">-</td>
                    </tr>
                    {(family.membersCount > 1) && (
                      <tr className="hover:bg-surface-container-lowest/50">
                        <td className="px-5 py-3 text-center text-on-surface-variant italic" colSpan={4}>
                          بدون تفاصيل - يوجد عدد {family.membersCount - 1} أفراد تابعين
                        </td>
                      </tr>
                    )}
                  </tbody>`;

code = code.replace(membersTableSearch, membersTableReplace);

// Replace Cases History Target
const casesHistorySearch = `<div className="flex items-start gap-4 p-4 border border-outline-variant/30 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm">كرتونة مواد غذائية (حملة رمضان)</h4>
                      <span className="text-[10px] bg-green-100 text-green-800 px-2 py-1 rounded font-bold">مستلم</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">تم تسليم كرتونة غذائية وبطانية ضمن قافلة رمضان.</p>
                    <span className="text-[10px] text-outline font-bold" dir="ltr">15 مارس 2024</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-primary/30 bg-primary/5 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-primary">تمكين اقتصادي (كشك)</h4>
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-bold border border-primary/20">قيد المراجعة</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">طلب تمكين اقتصادي لفتح كشك بقالة صغير بجوار المنزل.</p>
                    <Link href="/dashboard/cases/C-2024-055" className="text-[10px] text-primary font-bold hover:underline">عرض تفاصيل الحالة</Link>
                  </div>
                </div>`;

const casesHistoryReplace = `{family.cases && family.cases.length > 0 ? (
                  family.cases.map((c: any) => (
                    <div key={c.id} className="flex items-start gap-4 p-4 border border-outline-variant/30 hover:border-primary/50 transition-colors rounded-2xl bg-white">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined">folder_open</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-primary">{c.caseType}</h4>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold border border-primary/20">
                            {c.lifecycleStatus === 'DRAFT' ? 'مسودة' : c.lifecycleStatus}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-2 line-clamp-2">{c.description || "لا يوجد وصف للحالة"}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-outline font-bold" dir="ltr">
                            {new Date(c.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                          <Link href={\`/dashboard/cases/\${c.id}\`} className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1">
                            عرض تفاصيل الحالة
                            <span className="material-symbols-outlined text-[12px] rtl:rotate-180">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-on-surface-variant">
                    لا توجد حالات مسجلة لهذه الأسرة حتى الآن.
                  </div>
                )}`;

code = code.replace(casesHistorySearch, casesHistoryReplace);

// Replace Sidebar Info Hardcodes
code = code.replace(
  /<span className="font-bold tracking-widest block" dir="ltr">27512102200123<\/span>/g,
  '<span className="font-bold tracking-widest block" dir="ltr">{family.nationalId || "غير مسجل"}</span>'
);

code = code.replace(
  /<span className="font-bold block">بني سويف - المركز<\/span>/g,
  '<span className="font-bold block">{family.city || "غير مسجل"}</span>'
);

code = code.replace(
  /<span className="font-bold block">قرية باروط - شارع المستوصف القديم - منزل رقم 5<\/span>/g,
  '<span className="font-bold block">{family.addressDetails || family.address || "غير مسجل"}</span>'
);

code = code.replace(
  /<span className="font-bold block" dir="ltr">01012345678<\/span>/g,
  '<span className="font-bold block" dir="ltr">{family.phone || "غير مسجل"}</span>'
);

code = code.replace(
  /أسرة تعاني من فقر شديد بسبب إصابة العائل الرئيسي بكسر مضاعف منعه من العمل منذ عام\. الزوجة تعمل كعاملة نظافة متقطعة وأطفالهم في مراحل التعليم الأساسي وتوجد احتمالية لتسريبهم من التعليم لضعف الدخل\./g,
  '{family.job ? `الوظيفة: ${family.job}` : "بدون عمل مسجل"} — الحالة الاجتماعية: {family.socialStatus} — {family.income ? `الدخل التقريبي: ${family.income} ج.م` : "لا يوجد دخل مسجل"}'
);

fs.writeFileSync(filePath, code);
console.log("Done");
