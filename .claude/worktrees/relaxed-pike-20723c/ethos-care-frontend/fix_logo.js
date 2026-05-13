const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');
content = content.replace(/className="w-20 h-20 object-contain"/, 'className="w-20 h-20 object-contain brightness-0 invert"');
fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
console.log('Fixed logo');
