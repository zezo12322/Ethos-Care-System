const fs = require('fs');
let fileStr = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/families/new/page.tsx', 'utf8');

const oldMap = `               {Array.from({ length: membersCount }).map((_, i) => (
                 <div key={i} className="flex flex-col md:flex-row gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 relative">
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-outline-variant/30 flex items-center justify-center text-xs font-bold">{i+1}</div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold mb-1">الاسم</label>
                      <input type="text" className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm" />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-bold mb-1">السن</label>
                      <input type="number" dir="ltr" className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm" />
                    </div>
                    <div className="w-full md:w-48">
                      <label className="block text-xs font-bold mb-1">صلة القرابة</label>
                      <select className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm">
                        <option>ابن/ة</option>
                        <option>زوج/ة</option>
                        <option>أب/أم</option>
                        <option>أخرى</option>
                      </select>
                    </div>
                    <div className="w-full md:w-48">
                      <label className="block text-xs font-bold mb-1">المرحلة الدراسية</label>
                      <select className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm">
                        <option>لا يدرس</option>
                        <option>ابتدائي</option>
                        <option>إعدادي</option>
                        <option>ثانوي</option>
                        <option>جامعي</option>
                      </select>
                    </div>
                 </div>
               ))}`;

const newMap = `{membersData.map((member, i) => (
                 <div key={i} className="flex flex-col md:flex-row gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 relative">
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-outline-variant/30 flex items-center justify-center text-xs font-bold">{i+1}</div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold mb-1">الاسم</label>
                      <input type="text" value={member.name} onChange={(e) => handleMemberChange(i, 'name', e.target.value)} className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm focus:border-primary" />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-bold mb-1">السن</label>
                      <input type="number" dir="ltr" value={member.age} onChange={(e) => handleMemberChange(i, 'age', e.target.value)} className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm focus:border-primary" />
                    </div>
                    <div className="w-full md:w-48">
                      <label className="block text-xs font-bold mb-1">صلة القرابة</label>
                      <select value={member.relation} onChange={(e) => handleMemberChange(i, 'relation', e.target.value)} className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm focus:border-primary">
                        <option>ابن/ة</option>
                        <option>زوج/ة</option>
                        <option>أب/أم</option>
                        <option>أخرى</option>
                      </select>
                    </div>
                    <div className="w-full md:w-48">
                      <label className="block text-xs font-bold mb-1">المرحلة الدراسية</label>
                      <select value={member.education} onChange={(e) => handleMemberChange(i, 'education', e.target.value)} className="w-full bg-white border border-outline-variant/50 rounded-lg py-2 px-3 outline-none text-sm focus:border-primary">
                        <option>لا يدرس</option>
                        <option>ابتدائي</option>
                        <option>إعدادي</option>
                        <option>ثانوي</option>
                        <option>جامعي</option>
                      </select>
                    </div>
                 </div>
               ))}`;

if (fileStr.includes('length: membersCount')) {
    fileStr = fileStr.replace(oldMap, newMap);
    fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/families/new/page.tsx', fileStr);
    console.log("Success");
} else {
    console.log("Not found");
}

