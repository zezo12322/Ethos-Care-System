const fs = require('fs');

let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');

// The news section starts with <section className="py-20 bg-white"> and ends with </section> where comment before is {/* Latest News Section */}

const newsRegex = /\{\/\*\s*Latest News Section\s*\*\/\}[\s\S]*?<\/section>/;
if (newsRegex.test(pageContent)) {
  pageContent = pageContent.replace(newsRegex, '{/* Latest News Section */}\n        <DynamicNews />');
  console.log('Replaced news section.');
} else {
  console.log('News section not found.');
}

const partnersRegex = /\{\/\*\s*Support and Partners Section\s*\*\/\}[\s\S]*?<\/section>/;
if (partnersRegex.test(pageContent)) {
  pageContent = pageContent.replace(partnersRegex, '{/* Support and Partners Section */}\n        <DynamicPartners />');
  console.log('Replaced partners section.');
} else {
  console.log('Partners section not found.');
}

if (!pageContent.includes('import DynamicNews')) {
  pageContent = pageContent.replace('import DynamicStats from "@/components/DynamicStats";', 'import DynamicStats from "@/components/DynamicStats";\nimport DynamicNews from "@/components/DynamicNews";\nimport DynamicPartners from "@/components/DynamicPartners";');
}

fs.writeFileSync('src/app/page.tsx', pageContent);
console.log('Done!');
