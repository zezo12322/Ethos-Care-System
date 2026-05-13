const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// replace static name
if (!content.includes('useAuth')) {
  // Add import and client
  content = '"use client";\n\n' + content.replace('import React from "react";', 'import React from "react";\nimport { useAuth } from "@/contexts/AuthContext";');

  content = content.replace('export default function Header() {', 'export default function Header() {\n  const { user } = useAuth();\n  const roleNames: Record<string, string> = { "ADMIN": "مدير النظام", "CEO": "المدير التنفيذي", "CASE_WORKER": "باحث حالة", "DATA_ENTRY": "مدخل بيانات" };\n');

  content = content.replace('أحمد محمد', '{user ? user.name : "..."}');
  content = content.replace('مسؤول النظام', '{user ? (roleNames[user.role] || user.role) : "..."}');
  
  fs.writeFileSync('src/components/layout/Header.tsx', content);
  console.log('Header patched!');
}
