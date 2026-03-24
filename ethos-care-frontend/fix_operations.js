const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');
content = content.replace(
  /isAuthorized\(\["ADMIN", "MANAGER", "EXECUTION_OFFICER"\]\) && \(\s*<Link\s*href="\/dashboard\/operations"/g,
  'isAuthorized(["ADMIN", "MANAGER", "EXECUTION_OFFICER", "CEO", "CASE_WORKER", "DATA_ENTRY"]) && (\n        <Link\n          href="/dashboard/operations"'
);
fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
console.log('Fixed operations visibility');
