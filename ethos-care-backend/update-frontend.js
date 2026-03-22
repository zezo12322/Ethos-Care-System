const fs = require('fs');
let content = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/families/new/page.tsx', 'utf8');

// add keys to formData
content = content.replace('addressDetails: ""', 'addressDetails: "",\n    caseType: "تمكين اقتصادي",\n    priority: "عادي",\n    description: ""');

// Find where to inject the New case section
const sectionToInject = `
          <section className="bg-white p-6 md:p-8 border-b border-outline-variant/30">
             <div className="mb-6 flex justify-between items-center">
               <h2 className="text-lg font-bold font-headline flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">description</span>
                بيانات التدخل (الحالة المرتبطة)
              </h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">نوع التدخل المطلوب</label>
                  <select name="caseType" value={formData.caseType} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-on-surface">
                    <option>تمكين اقتصادي</option>
                    <option>تدخل طبي</option>
                    <option>سكن كريم</option>
                    <option>تعليم</option>
                    <option>أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">أولوية التدخل</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-on-surface">
                    <option>عادي</option>
                    <option>عالي</option>
                    <option>عاجل</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-on-surface mb-2">وصف الحالة / ملاحظات الباحث</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-on-surface" placeholder="اكتب تفاصيل احتياج الأسرة للتدخل..."></textarea>
                </div>
             </div>
          </section>
`;

content = content.replace('</form>', `</form>\n${sectionToInject}`); // assuming it ends with </section> let's check exact struct

fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/families/new/page.tsx.tmp', content);
console.log("Done");
