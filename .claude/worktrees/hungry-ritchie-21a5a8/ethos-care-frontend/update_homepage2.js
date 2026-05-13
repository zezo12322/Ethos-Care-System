const fs = require('fs');

let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');

// replace news section
const newsRegex = /\{\/\* Latest News Section \*\/\}[\s\S]*?(?=\{\/\* Support and Partners Section \*\/\}|\{\/\* Footer \*\/\}|<DynamicPartners)/;
pageContent = pageContent.replace(newsRegex, '{/* Latest News Section */}\n        <DynamicNews />\n\n        ');

// replace partners section
const partnersRegex = /\{\/\* Support and Partners Section \*\/\}[\s\S]*?(?=\{\/\* Footer \*\/\}|<footer)/;
pageContent = pageContent.replace(partnersRegex, '{/* Support and Partners Section */}\n        <DynamicPartners />\n\n        ');

if (!pageContent.includes('import DynamicNews')) {
  pageContent = pageContent.replace('import DynamicStats from "@/components/DynamicStats";', 'import DynamicStats from "@/components/DynamicStats";\nimport DynamicNews from "@/components/DynamicNews";\nimport DynamicPartners from "@/components/DynamicPartners";\n');
}

fs.writeFileSync('src/app/page.tsx', pageContent);
console.log('Done!');
