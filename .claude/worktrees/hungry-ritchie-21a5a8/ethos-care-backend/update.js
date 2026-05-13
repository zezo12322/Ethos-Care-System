const fs = require('fs');

let fileStr = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/families/new/page.tsx', 'utf8');

// Replace state
fileStr = fileStr.replace('const [membersCount, setMembersCount] = useState(1);', `const [membersData, setMembersData] = useState([ { name: "", age: "", relation: "ابن/ة", education: "لا يدرس" } ]);`);

// Add handlers for members inside the component
fileStr = fileStr.replace('const handleChange = (e', `
  const handleMemberChange = (index: number, field: string, value: string) => {
    const newMembers = [...membersData];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembersData(newMembers);
  };

  const updateMembersCount = (newCount: number) => {
    if (newCount < 0) return;
    if (newCount > membersData.length) {
      const diff = newCount - membersData.length;
      const additional = Array(diff).fill(null).map(() => ({ name: "", age: "", relation: "ابن/ة", education: "لا يدرس" }));
      setMembersData([...membersData, ...additional]);
    } else {
      setMembersData(membersData.slice(0, newCount));
    }
  };

  const handleChange = (e`);

// Update handleSubmit
fileStr = fileStr.replace('const handleSubmit = async () => {', `const handleSubmit = async () => {
    if (membersData.length > 0) {
      const hasInvalid = membersData.some(m => !m.name.trim() || !m.age);
      if (hasInvalid) {
        alert("الرجاء إدخال اسم وسن جميع الأفراد التابعين بشكل صحيح");
        return;
      }
    }`);

fileStr = fileStr.replace('membersCount: membersCount + 1,', 'membersCount: membersData.length + 1,');
fileStr = fileStr.replace('...formData,', '...formData,\n        membersDetails: membersData,'); 

// Update UI
fileStr = fileStr.replace('setMembersCount(Math.max(0, membersCount - 1))', 'updateMembersCount(membersData.length - 1)');
fileStr = fileStr.replace('{membersCount}', '{membersData.length}');
fileStr = fileStr.replace('setMembersCount(membersCount + 1)', 'updateMembersCount(membersData.length + 1)');

// The loop
let loopRegex = /\{Array\.from\(\{ length: membersCount \}\)\.map\(\(_, i\) => \([\s\S]*?\}\)/;

let newLoop = `{membersData.map((member, i) => (
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
fileStr = fileStr.replace(/\{Array\.from\(\{ length: membersCount \}\)\.map\(\(_, i\) => \([\s\S]*?\}\)\)/, newLoop);
fileStr = fileStr.replace('{membersCount === 0', '{membersData.length === 0');

fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/families/new/page.tsx', fileStr);
