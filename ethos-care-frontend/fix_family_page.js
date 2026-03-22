const fs = require('fs');
const file = '/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/families/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The file currently has hardcoded dummy data. Let's wrap it heavily or simply do a focused replace to hook up state.
const reactImports = `import React, { useState, useEffect } from "react";\nimport api from "@/lib/axios";`;
content = content.replace('import React from "react";', reactImports);

// Find the component start
const componentStartParams = 'export default function FamilyDetailsPage({ params }: { params: { id: string } }) {';
const componentLogic = `
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const familyId = params.id;

  useEffect(() => {
    api.get(\`/families/\${familyId}\`).then(res => {
      setFamily(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [familyId]);

  if (loading) return <div className="p-8 text-center">جاري تحميل بيانات الأسرة...</div>;
  if (!family) return <div className="p-8 text-center text-red-500">حدث خطأ أو لم يتم العثور على الأسرة</div>;
`;

content = content.replace(
  'const familyId = params.id || "F-2024-101";',
  componentLogic
);

// Replace hardcoded name
content = content.replace(
  'أسرة / محمود عبدالرحمن السيد',
  'أسرة / {family.headName || "بدون اسم"}'
);

// Replace family ID display
content = content.replace(
  '>{familyId}</p>',
  '>{family.id || familyId}</p>'
);

// Replace stats
content = content.replace(
  '5 أفراد',
  '{family.membersCount || 2} أفراد'
);
content = content.replace(
  '1200 ج.م',
  '{family.income || "0"} ج.م'
);
content = content.replace(
  '12 أكتوبر 2023',
  '{family.lastVisit ? new Date(family.lastVisit).toLocaleDateString("ar-EG") : "غير محدد"}'
);

// Replace dynamic texts inside the grid
content = content.replace(
  '<p className="font-bold">2900101220034</p>',
  '<p className="font-bold">{family.nationalId || "غير مدرج"}</p>'
);

content = content.replace(
  '<p className="font-bold">01001234567</p>',
  '<p className="font-bold">{family.phone || "غير مدرج"}</p>'
);

content = content.replace(
  '<p className="font-bold">بني سويف - المركز</p>',
  '<p className="font-bold">{family.city || "غير مدرج"}</p>'
);

content = content.replace(
  '<p className="font-bold">عزبة الصعايدة - منزل رقم 14</p>',
  '<p className="font-bold">{family.address || family.addressDetails || "غير مدرج"}</p>'
);

fs.writeFileSync(file, content);
console.log('Fixed family details basic info!');
