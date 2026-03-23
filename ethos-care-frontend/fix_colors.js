const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');
content = content.replace(/text-primary-200\/70/g, 'text-white/70');
content = content.replace(/text-primary-200\/60/g, 'text-white/60');
content = content.replace(/text-primary-200\/40/g, 'text-white/40');
content = content.replace(/hover:bg-primary-800\/30/g, 'hover:bg-white/10');
content = content.replace(/border-primary-800\/50/g, 'border-white/10');
fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
console.log('Fixed Sidebar.tsx colors');
