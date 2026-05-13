const fs = require('fs');

let content = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/new/page.tsx', 'utf8');

content = content.replace(
`    const handleSubmit = async () => {
      if (!formData.applicantName || !formData.caseType) {
        alert("الرجاء إدخال اسم المستفيد ونوع التدخل");
        return;
      }`,
`    const handleSubmit = async () => {
      if (!familyFound) {
        alert("يجب البحث عن الأسرة واختيارها أولاً لربط الحالة بها");
        return;
      }
      if (!formData.applicantName || !formData.caseType) {
        alert("الرجاء إدخال اسم المستفيد ونوع التدخل");
        return;
      }`
);

fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/new/page.tsx', content);
