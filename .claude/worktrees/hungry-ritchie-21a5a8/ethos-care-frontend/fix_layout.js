const fs = require('fs');
let content = fs.readFileSync('src/app/layout.tsx', 'utf8');

if (!content.includes('AuthProvider')) {
  content = content.replace('import "./globals.css";', 'import "./globals.css";\nimport { AuthProvider } from "@/contexts/AuthContext";');
  content = content.replace('{children}', '<AuthProvider>{children}</AuthProvider>');
  fs.writeFileSync('src/app/layout.tsx', content);
  console.log('Layout patched');
}
