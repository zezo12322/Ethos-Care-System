const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

if (!content.includes('useAuth')) {
  // Add import
  content = content.replace('import React from "react";', 'import React from "react";\nimport { useAuth } from "@/contexts/AuthContext";');

  // Add hook inside component
  content = content.replace('export default function Sidebar() {', 'export default function Sidebar() {\n  const { user } = useAuth();\n  const userRole = user?.role || "CASE_WORKER"; // default \n\n  // Check if role is authorized\n  const isAuthorized = (allowedRoles: string[]) => allowedRoles.includes(userRole);\n');

  // Now replace all <Link ...> with {isAuthorized([...]) && <Link ...>}
  
  const replacements = [
    { text: 'href="/dashboard"', condition: 'isAuthorized(["ADMIN", "CEO", "CASE_WORKER", "DATA_ENTRY"])' },
    { text: 'href="/dashboard/operations"', condition: 'isAuthorized(["ADMIN", "MANAGER"])' },
    { text: 'href="/dashboard/cases"', condition: 'isAuthorized(["ADMIN", "CASE_WORKER", "DATA_ENTRY", "CEO"])' },
    { text: 'href="/dashboard/families"', condition: 'isAuthorized(["ADMIN", "CASE_WORKER", "DATA_ENTRY"])' },
    { text: 'href="/dashboard/search"', condition: 'isAuthorized(["ADMIN", "CEO", "CASE_WORKER", "DATA_ENTRY"])' },
    { text: 'href="/dashboard/reports"', condition: 'isAuthorized(["ADMIN", "CEO", "MANAGER"])' },
    { text: 'href="/dashboard/partners"', condition: 'isAuthorized(["ADMIN", "CEO"])' },
    { text: 'href="/dashboard/news"', condition: 'isAuthorized(["ADMIN", "CEO"])' },
    { text: 'href="/dashboard/locations"', condition: 'isAuthorized(["ADMIN", "CEO", "CASE_WORKER"])' },
    { text: 'href="/dashboard/admin"', condition: 'isAuthorized(["ADMIN"])' },
  ];

  let newContent = "";
  let insideLink = false;
  let currentCondition = "";
  let lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.includes('<Link') && !line.includes('</Link>')) {
      // Find which href it is
      let matched = false;
      for (let j = i; j < i + 5; j++) {
        if (lines[j]) {
          for (const rep of replacements) {
            if (lines[j].includes(rep.text)) {
              currentCondition = rep.condition;
              newContent += `        {${currentCondition} && (\n`;
              matched = true;
              break;
            }
          }
          if (matched) break;
        }
      }
      insideLink = true;
      newContent += line + '\n';
    } 
    else if (line.includes('</Link>')) {
      newContent += line + '\n';
      if (insideLink && currentCondition) {
        newContent += `        )}\n`;
        currentCondition = "";
      }
      insideLink = false;
    } 
    else {
      newContent += line + '\n';
    }
  }

  content = newContent;
  
  // also inject `"use client";` at top since we use useAuth
  if(!content.includes('"use client"')) {
    content = '"use client";\n' + content;
  }
  
  fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
  console.log('Sidebar RBAC added!');
}
