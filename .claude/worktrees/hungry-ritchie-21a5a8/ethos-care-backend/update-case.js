const fs = require('fs');

let content = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/new/page.tsx', 'utf8');

const newImports = `
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
`;

content = content.replace(/import Link from "next\/link";\nimport React, { useState } from "react";/, newImports);

let newSearch = `
  const searchFamily = async () => {
    if (!nationalId || nationalId.length < 14) {
      alert("الرجاء إدخال رقم قومي صحيح (14 رقم)");
      return;
    }
    
    setSearchLoading(true);
    try {
      const res = await api.get(\`/search?q=\${nationalId}\`);
      if (res.data.found && res.data.family) {
        setFamilyFound(true);
        // Pre-fill some fields since family is found
        setFormData(prev => ({
          ...prev,
          name: res.data.family.name,
          nationalId: nationalId,
          familyId: res.data.family.id
        }));
      } else {
        alert("لم يتم العثور على أسرة بهذا الرقم القومي. يرجى تسجيل الأسرة أولاً.");
        setFamilyFound(false);
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء البحث");
    } finally {
      setSearchLoading(false);
    }
  };
`;

content = content.replace(/const searchFamily = async \(\) => {[\s\S]*?}, 1000\);\n  };/, newSearch);

fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/new/page.tsx', content);
